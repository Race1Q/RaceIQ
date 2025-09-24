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
    <Box w="100%">
      <Swiper
        modules={[Navigation]}
        navigation={true}
        initialSlide={initialSlideIndex}
        slidesPerView={3}
        centeredSlides={true}
        spaceBetween={30}
        loop={false}
        className={styles.raceSlider}
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


