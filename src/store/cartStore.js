// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CartAPI from '../api/cart/cart';
import { message } from 'antd';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // UI에서 쓰는 아이템 배열
      index: {}, // contentId -> tourId 매핑 (서버 삭제용)
      loading: false,

      // 서버 → 스토어 동기화
      loadFromServer: async () => {
        try {
          set({ loading: true });
          const data = await CartAPI.list(); // { cartId, region, tours: [...] }
          const tours = Array.isArray(data?.tours) ? data.tours : [];
          const prevMap = new Map(
            get().items.map((it) => [String(it.contentId), it])
          );

          const index = {};
          const items = tours.map((t) => {
            const cid = String(t.contentId ?? '');
            index[cid] = String(t.tourId ?? '');
            const prev = prevMap.get(cid);
            return {
              contentId: cid,
              name: t.title,
              address: t.address,
              imageUrl: t.image,
              price: prev?.price ?? Number(t.price ?? 0), // 서버에 없으면 기존 값 유지
              location: {
                lat:
                  typeof t.latitude === 'number'
                    ? t.latitude
                    : Number(t.latitude),
                lng:
                  typeof t.longitude === 'number'
                    ? t.longitude
                    : Number(t.longitude),
              },
              category: t.category,
              theme: t.theme,
            };
          });

          set({ items, index, loading: false });
          return { items, index };
        } catch (e) {
          set({ loading: false });
          console.error('[cart/loadFromServer] fail', e?.response?.data || e);
          throw e;
        }
      },

      // 추가: 서버에 POST 후 최신상태 재조회
      addToCart: async (item) => {
        try {
          const contentId = String(item?.contentId ?? '').trim();
          if (!contentId) return;
          await CartAPI.addSimple(contentId);
          // 바로 재조회해서 index/tourId까지 최신화
          await get().loadFromServer();

          // UI에서 쓰는 가격/이미지 등 보존(서버 응답에 없을 수 있음)
          set((state) => {
            const exists = state.items.some(
              (it) => String(it.contentId) === contentId
            );
            if (exists) {
              // 이미 서버에서 받아온 아이템에 price 덮어쓰기
              const items = state.items.map((it) =>
                String(it.contentId) === contentId ? { ...it, ...item } : it
              );
              return { items };
            } else {
              return { items: [...state.items, item] };
            }
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

      // 제거: contentId -> tourId 찾은 뒤 DELETE
      removeByContentId: async (contentId) => {
        try {
          const cid = String(contentId);
          let tourId = get().index[cid];
          if (!tourId) {
            // 매핑이 없으면 새로 조회해서 찾기
            const { index } = await get().loadFromServer();
            tourId = index[cid];
          }
          if (!tourId)
            throw new Error('해당 항목의 tourId를 찾을 수 없습니다.');

          await CartAPI.remove(tourId);
          set((state) => ({
            items: state.items.filter((it) => String(it.contentId) !== cid),
            index: Object.fromEntries(
              Object.entries(state.index).filter(([k]) => k !== cid)
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

      // 전체 비우기
      clear: async () => {
        try {
          await CartAPI.clearAll();
          set({ items: [], index: {} });
          message.success('장바구니를 비웠습니다.');
        } catch (e) {
          console.error('[cart/clear] fail', e?.response?.data || e);
          message.error(
            e?.response?.data?.message ?? '장바구니 비우기에 실패했습니다.'
          );
          throw e;
        }
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
    { name: 'cart' }
  )
);

export default useCartStore;
