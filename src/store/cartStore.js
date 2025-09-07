import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import CartAPI from '../api/cart/cart';
import { message } from 'antd';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartId: null, // cartId 보관
      lastCodes: null, // { ldongRegnCd, ldongSignguCd }
      items: [],
      loading: false,

      // 카트 보장: 없거나 지역코드 바뀌면 새로 생성
      ensureCart: async ({ ldongRegnCd, ldongSignguCd }) => {
        const state = get();
        const sameCodes =
          state.lastCodes &&
          state.lastCodes.ldongRegnCd === String(ldongRegnCd) &&
          state.lastCodes.ldongSignguCd === String(ldongSignguCd);

        if (state.cartId && sameCodes) return state.cartId;

        set({ loading: true });
        try {
          const created = await CartAPI.createCart({
            ldongRegnCd,
            ldongSignguCd,
          });
          const cartId = created?.cartId;
          const tours = Array.isArray(created?.tours) ? created.tours : [];
          if (!cartId) throw new Error('cartId가 응답에 없습니다.');

          const items = tours.map((t) => ({
            contentId: String(t.contentId ?? ''),
            name: t.title,
            address: t.address,
            imageUrl: t.image,
            price: Number(t.price ?? 0),
            location: { lat: Number(t.latitude), lng: Number(t.longitude) },
            category: t.category,
            theme: t.theme ?? t.tema ?? '',
          }));

          set({
            cartId,
            lastCodes: {
              ldongRegnCd: String(ldongRegnCd),
              ldongSignguCd: String(ldongSignguCd),
            },
            items,
            loading: false,
          });
          return cartId;
        } catch (e) {
          set({ loading: false });
          console.error('[cart/ensureCart] fail', e?.response?.data || e);
          throw e;
        }
      },

      // 서버 동기화 (cartId 필요)
      loadFromServer: async () => {
        const { cartId } = get();
        if (!cartId) {
          const err = new Error('카트가 아직 준비되지 않았습니다.');
          err.code = 'NO_CART';
          throw err;
        }
        try {
          set({ loading: true });
          const data = await CartAPI.getCart(cartId);
          const tours = Array.isArray(data?.tours) ? data.tours : [];

          const prevMap = new Map(
            get().items.map((it) => [String(it.contentId), it])
          );

          const items = tours.map((t) => {
            const cid = String(t.contentId ?? '');
            const prev = prevMap.get(cid);
            return {
              contentId: cid,
              name: t.title,
              address: t.address,
              imageUrl: t.image,
              price: prev?.price ?? Number(t.price ?? 0),
              location: { lat: Number(t.latitude), lng: Number(t.longitude) },
              category: t.category,
              theme: t.theme ?? t.tema ?? '',
            };
          });

          set({ items, loading: false });
          return { items };
        } catch (e) {
          set({ loading: false });
          console.error('[cart/loadFromServer] fail', e?.response?.data || e);
          throw e;
        }
      },

      // 추가
      addToCart: async (item) => {
        const { cartId, ensureCart, lastCodes } = get();
        try {
          if (!cartId) {
            if (!lastCodes) throw new Error('카트가 준비되지 않았습니다.');
            await ensureCart(lastCodes);
          }
          const id = get().cartId;
          const contentId = String(item?.contentId ?? '').trim();
          if (!contentId) return;

          await CartAPI.addTourByContentId(id, contentId);
          await get().loadFromServer();

          set((state) => {
            const exists = state.items.some(
              (it) => String(it.contentId) === contentId
            );
            if (exists) {
              return {
                items: state.items.map((it) =>
                  String(it.contentId) === contentId ? { ...it, ...item } : it
                ),
              };
            }
            return { items: [...state.items, item] };
          });

          message.success('장바구니에 추가했습니다.');
        } catch (e) {
          console.error('[cart/addToCart] fail', e?.response?.data || e);
          message.error(
            e?.response?.data?.message ?? '장바구니 추가에 실패했습니다.'
          );
          throw e;
        }
      },

      // contentId로 제거
      removeByContentId: async (contentId) => {
        const { cartId } = get();
        try {
          if (!cartId) throw new Error('카트가 준비되지 않았습니다.');
          await CartAPI.removeByContentId(cartId, String(contentId));
          set((state) => ({
            items: state.items.filter(
              (it) => String(it.contentId) !== String(contentId)
            ),
          }));
          message.info('장바구니에서 제거했습니다.');
        } catch (e) {
          console.error(
            '[cart/removeByContentId] fail',
            e?.response?.data || e
          );
          message.error(
            e?.response?.data?.message ?? '장바구니 제거에 실패했습니다.'
          );
          throw e;
        }
      },

      // 전체 비우기: 카트 삭제 후 같은 코드로 빈 카트 재생성
      clear: async () => {
        const { cartId, lastCodes } = get();
        try {
          // 서버 삭제 대신 프론트 상태만 비움(또는 서버에 "비우기" 엔드포인트가 있으면 그걸 사용)
          set({ items: [] });
          if (lastCodes) {
            // 필요하면 새 카트 강제 생성하고 cartId 갱신
            await get().ensureCart(lastCodes);
          }
          message.success('장바구니를 비웠습니다.');
        } catch (e) {
          console.error('[cart/clear] fail', e?.response?.data || e);
          message.error(
            e?.response?.data?.message ?? '장바구니 비우기에 실패했습니다.'
          );
          throw e;
        }
      },

      // 새 일정 시작: 카트 완전 초기화(삭제)
      resetForNewPlan: async () => {
        try {
        } finally {
          set({ cartId: null, items: [], lastCodes: null });
        }
      },

      // 영구 저장까지 삭제 — 로그아웃 등
      clearPersisted: () => {
        set({ cartId: null, lastCodes: null, items: [], loading: false });
        try {
          localStorage.removeItem('cart-v3');
        } catch {}
      },

      // 유틸
      isInCart: (contentId) =>
        get().items.some((it) => String(it.contentId) === String(contentId)),
      totalCost: () =>
        get().items.reduce(
          (sum, it) => sum + Number(it.price ?? it.cost ?? 0),
          0
        ),
    }),
    {
      name: 'cart-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        cartId: s.cartId,
        lastCodes: s.lastCodes,
        items: s.items,
      }),
    }
  )
);

export default useCartStore;
