import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

import DefaultLayout from '../layouts/DefaultLayout';
import MainHeader from '../components/header/MainHeader';
import SideMenu from '../components/modal/SideMenu';
import CreateScheduleCard from '../components/mypage/CreateScheduleCard';
import LocationSection from '../components/location/LocationSection';
import TravelDiaryList from '../components/traveldiary/TravelDiaryList';

import useUserStore from '../store/userStore';
import { getHotRegions } from '../api/region/getHotRegions';  


const HomePage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [hotRegions, setHotRegions] = useState([]);

  const initializeFromStorage = useUserStore(
    (state) => state.initializeFromStorage
  );

  useEffect(() => {
    useUserStore.getState().initializeFromStorage();
  }, []);

   useEffect(() => {
    const fetchHot = async () => {
      const res = await getHotRegions(10);
      if (res.success) {
        const formatted = res.data.map((item) => ({
          city: item.regionName,
          name: item.regionName,
          image: item.regionImage,
          description: item.description,
        }));
        setHotRegions(formatted);
      }
    };
    fetchHot();
  }, []);

  return (
    <>
      <DefaultLayout>
        <div className="w-full mx-auto">
          <MainHeader isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <div className="mt-[1rem]">

            {isMenuOpen && <SideMenu onClose={() => setIsMenuOpen(false)} />}

            <main className="w-full px-4 sm:px-6 md:px-8">
              <CreateScheduleCard />

              <LocationSection
                title="요즘 핫플"
                type="hot"
                locations={hotRegions}
                showMore={true}
                navigateTo="/board/hot"
              />
              <div className="pb-[2rem]">
                <TravelDiaryList title="여행 일기" showMore={true} />
              </div>
            </main>
          </div>
        </div>
      </DefaultLayout>
    </>
  );
};

export default HomePage;
