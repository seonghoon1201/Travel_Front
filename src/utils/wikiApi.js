export const fetchWikipediaData = async (title) => {
  try {
    const url = `https://ko.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&format=json&explaintext=true&piprop=original&titles=${encodeURIComponent(
      title
    )}&origin=*`;

    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];

    return {
      title: page.title,
      extract: page.extract || '',
      imageUrl: page.original?.source || null,
    };
  } catch (error) {
    console.error('위키백과 API 요청 실패:', error);
    return {
      title,
      extract: '요약 정보를 불러오는 데 실패했어요.',
      imageUrl: null,
    };
  }
};
