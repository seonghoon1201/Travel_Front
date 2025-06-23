import React from 'react';
import { Card } from 'antd';
const { Meta } = Card;

const TravelDiaryList = ({ diaries = [], title, showMore }) => {
  return (
    <div className="mb-8">
      {/* 제목과 더보기 버튼 */}
      <div className="flex justify-between items-center px-1 mb-2">
        <h2 className="text-lg font-jalnongothic">{title}</h2>
        {showMore && (
          <button className="font-pretendard text-sm text-blue-500 border rounded-full px-2 py-0.5">
            + 더보기
          </button>
        )}
      </div>
      <section className="flex gap-4 px-4 py-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {diaries.slice(0, 5).map((diary) => (
          <Card
            key={diary.id}
            hoverable
            style={{ width: 160 }}
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
