import { Alert, AlertIcon, AlertTitle } from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';
import { getCalendarSeasonYear } from '../../lib/seasonYear';

type Props = {
  defaultSeasonYear: number;
  /** True while `/api/seasons` is still resolving */
  loading: boolean;
};

/** Shown when the current calendar year’s season is not in `/api/seasons` yet (e.g. 2026 not ingested). */
export default function PendingSeasonDataBanner({ defaultSeasonYear, loading }: Props) {
  const calendarYear = getCalendarSeasonYear();
  if (loading || calendarYear <= defaultSeasonYear) return null;

  return (
    <Alert status="warning" variant="subtle" borderRadius="md" mb={4}>
      <AlertIcon as={AlertTriangle} />
      <AlertTitle fontSize="sm" fontWeight="semibold">
        The {calendarYear} season information has not been loaded yet.
      </AlertTitle>
    </Alert>
  );
}
