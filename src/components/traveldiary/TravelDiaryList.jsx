import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'antd';
import { getDiary } from '../../api/board/getDiary';

const { Meta } = Card;

const TravelDiaryList = ({ title, showMore }) => {
  const [diaries, setDiaries] = useState([]);
  const navigate = useNavigate(); // navigate 추가

  useEffect(() => {
    const fetchDiaries = async () => {
      const res = await getDiary(0, 6); // 함수명 변경
      if (res.success) {
        const formatted = res.data.map((item) => ({
          id: item.boardId,
          title: item.title,
          image: item.imageUrl,
        }));
        setDiaries(formatted);
      }
    };
    fetchDiaries();
  }, []);

  return (
    <div>
      {/* 제목과 더보기 버튼 */}
      <div className="flex justify-between items-center px-2 mb-2">
        <h2 className=" font-jalnongothic">{title}</h2>
        {showMore && (
          <button
            className="font-pretendard text-sm text-blue-500 border rounded-full px-2 py-0.5"
            onClick={() => navigate('/board/travel/diary')}
          >
            + 더보기
          </button>
        )}
      </div>
      <section className="flex gap-4 px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {diaries.slice(0, 5).map((diary) => (
          <Card
            key={diary.id}
            hoverable
            style={{ width: 160 }}
            onClick={() => navigate(`/board/travel/diary/${diary.id}`)}
            cover={
              diary.image ? (
                <img
                  alt={diary.title}
                  src={diary.image}
                  style={{ height: 120, objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: 120, backgroundColor: '#d9d9d9' }} />
              )
            }
          >
            <Meta title={diary.title} />
          </Card>
        ))}
      </section>
    </div>
  );
};

export default TravelDiaryList;
