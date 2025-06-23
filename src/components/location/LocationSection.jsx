const LocationSection = ({ title, locations, showMore }) => {
  return (
    <section className=" mb-5">
      {/* 게시글 이름, 더보기 버튼 */}
      <div className="flex justify-between items-center px-3">
        <h2 className="text-lg font-jalnongothic">{title}</h2>
        {showMore && (
          <button className="font-pretendard text-sm text-blue-500 border rounded-full px-2 py-0.5">
            + 더보기
          </button>
        )}
      </div>
      {/* 리스트 */}
      <div className="flex overflow-x-auto mt-2 px-3 space-x-4 scrollbar-hide">
        {locations.slice(0, 8).map((loc, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 flex flex-col items-center w-20"
          >
            <img
              src={loc.image}
              alt={loc.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <p className="text-semibold font-noonnu mt-1">{loc.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LocationSection;
