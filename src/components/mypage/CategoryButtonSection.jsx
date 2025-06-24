import React from 'react';
import CategoryButton from '../common/CategoryButton';

const CategoryButtonsSection = ({ activeCategory, setActiveCategory }) => {
  const categories = ['전체', '레저', '역사', '먹거리', '힐링', '쇼핑'];

  const handleClick = (category) => {
    setActiveCategory(category);
    console.log('선택된 카테고리:', category);
  };

  return (
    <div className="flex flex-wrap gap-2 px-2 py-2">
      {categories.map((category) => (
        <CategoryButton
          key={category}
          label={category}
          isActive={activeCategory === category}
          onClick={() => handleClick(category)}
        />
      ))}
    </div>
  );
};

export default CategoryButtonsSection;
