import React from 'react';
import { Box } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { RaceWithPodium } from '../../hooks/useHomePageData';
import { RaceCard } from './RaceCard.tsx';
import styles from './RaceSlider.module.css';

export type RaceStatus = 'past' | 'previous' | 'live' | 'next-upcoming' | 'future';

interface RaceSliderProps {
  seasonSchedule: RaceWithPodium[];
}

export const RaceSlider: React.FC<RaceSliderProps> = ({ seasonSchedule }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextRaceIndex = seasonSchedule.findIndex((race) => new Date(race.date) >= today);
  const initialSlideIndex = nextRaceIndex === -1 ? seasonSchedule.length - 1 : nextRaceIndex;

  const getRaceStatus = (race: RaceWithPodium, index: number): RaceStatus => {
    const raceDate = new Date(race.date);
    raceDate.setHours(0, 0, 0, 0);

    if (raceDate.getTime() === today.getTime()) return 'live';
    if (index === nextRaceIndex) return 'next-upcoming';
    if (index === nextRaceIndex - 1) return 'previous';
    if (index < nextRaceIndex) return 'past';
    return 'future';
  };

  return (
    <Box w="100%" overflow="hidden">
      <Swiper
        modules={[Navigation]}
        navigation={true}
        initialSlide={initialSlideIndex}
        slidesPerView={{ base: 1, sm: 2, md: 3 }}
        centeredSlides={true}
        spaceBetween={{ base: 20, sm: 25, md: 30 }}
        loop={false}
        className={styles.raceSlider}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 25,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
      >
        {seasonSchedule.map((race, index) => (
          <SwiperSlide key={race.id} className={styles.raceSlide}>
            {({ isActive }) => (
              <RaceCard
                race={race}
                isActive={isActive}
                status={getRaceStatus(race, index)}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};


