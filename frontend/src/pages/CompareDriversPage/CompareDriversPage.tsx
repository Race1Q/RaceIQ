// frontend/src/pages/CompareDriversPage/CompareDriversPage.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { Box, Heading, Grid, Flex, Text, Button, VStack } from '@chakra-ui/react';
import { useRef, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useDriverComparison } from '../../hooks/useDriverComparison';
import type { SelectOption } from '../../components/DropDownSearch/SearchableSelect';
import { DriverSelectionPanel } from './components/DriverSelectionPanel';
import { ComparisonTable } from './components/ComparisonTable';
import F1LoadingSpinner from '../../components/F1LoadingSpinner/F1LoadingSpinner';
import PageHeader from '../../components/layout/PageHeader';
import PdfComparisonCard from '../../components/compare/PdfComparisonCard';
import { getTeamColor } from '../../lib/teamColors';
import { driverHeadshots } from '../../lib/driverHeadshots';
import { driverTeamMapping } from '../../lib/driverTeamMapping';


const CompareDriversPage = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  // Enhanced hook with new comparison features
  const { 
    allDrivers, 
    driver1, 
    driver2, 
    loading, 
    error, 
    handleSelectDriver,
    // NEW: Comparison features
    years,
    selection1,
    selection2,
    stats1,
    stats2,
    enabledMetrics,
    score,
    selectDriver,
    toggleMetric,
    clearSelection,
  } = useDriverComparison();

  // Build dropdown options with proper name fallbacks
  const driverOptions: SelectOption[] = allDrivers.map((d) => {
    // Create a proper display name with fallbacks
    const displayName = d.full_name || 
                       (d.given_name && d.family_name ? `${d.given_name} ${d.family_name}` : '') ||
                       d.code ||
                       `Driver ${d.id}`;
    
    return {
      value: String(d.id),
      label: displayName,
    };
  }).filter(option => option.label.trim() !== ''); // Remove any entries with empty labels

  // PDF Export - reference to hidden PDF card
  const pdfCardRef = useRef<HTMLDivElement>(null);

  // Get full driver info for PDF (using hardcoded mappings)
  const pdfDriver1 = useMemo(() => {
    if (!selection1 || !stats1) return null;
    
    const driverData = allDrivers.find(d => String(d.id) === String(selection1.driverId));
    const fullName = driverData?.full_name || 
                    (driverData?.given_name && driverData?.family_name ? `${driverData.given_name} ${driverData.family_name}` : '') ||
                    driver1?.fullName || 
                    'Unknown';
    
    // Use hardcoded mappings
    const teamName = driverTeamMapping[fullName] || 'Unknown Team';
    const teamColor = getTeamColor(teamName, { hash: true }); // Get hex WITH # prefix
    const imageUrl = driverHeadshots[fullName] || '';
    
    return {
      fullName,
      teamName,
      teamColorToken: teamColor,
      imageUrl,
    };
  }, [selection1, stats1, allDrivers, driver1]);

  const pdfDriver2 = useMemo(() => {
    if (!selection2 || !stats2) return null;
    
    const driverData = allDrivers.find(d => String(d.id) === String(selection2.driverId));
    const fullName = driverData?.full_name || 
                    (driverData?.given_name && driverData?.family_name ? `${driverData.given_name} ${driverData.family_name}` : '') ||
                    driver2?.fullName || 
                    'Unknown';
    
    // Use hardcoded mappings
    const teamName = driverTeamMapping[fullName] || 'Unknown Team';
    const teamColor = getTeamColor(teamName, { hash: true }); // Get hex WITH # prefix
    const imageUrl = driverHeadshots[fullName] || '';
    
    return {
      fullName,
      teamName,
      teamColorToken: teamColor,
      imageUrl,
    };
  }, [selection2, stats2, allDrivers, driver2]);

  // Prepare comparison rows for PDF
  const comparisonRows = useMemo(() => {
    if (!pdfDriver1 || !pdfDriver2 || !stats1 || !stats2 || !enabledMetrics) return [];

    const useYearStats = stats1.yearStats !== null && stats2.yearStats !== null;
    const s1 = useYearStats ? stats1.yearStats! : stats1.career;
    const s2 = useYearStats ? stats2.yearStats! : stats2.career;

    const rows: Array<{ label: string; value1: number | string; value2: number | string; better1?: boolean; better2?: boolean }> = [];

    // Add team info
    rows.push({ label: 'Team', value1: pdfDriver1.teamName || 'Unknown', value2: pdfDriver2.teamName || 'Unknown' });

    if (enabledMetrics.wins) {
      const better1 = s1.wins > s2.wins;
      const better2 = s2.wins > s1.wins;
      rows.push({ label: 'Wins', value1: s1.wins, value2: s2.wins, better1, better2 });
    }
    if (enabledMetrics.podiums) {
      const better1 = s1.podiums > s2.podiums;
      const better2 = s2.podiums > s1.podiums;
      rows.push({ label: 'Podiums', value1: s1.podiums, value2: s2.podiums, better1, better2 });
    }
    if (enabledMetrics.fastestLaps) {
      const better1 = s1.fastestLaps > s2.fastestLaps;
      const better2 = s2.fastestLaps > s1.fastestLaps;
      rows.push({ label: 'Fastest Laps', value1: s1.fastestLaps, value2: s2.fastestLaps, better1, better2 });
    }
    if (enabledMetrics.points) {
      const better1 = s1.points > s2.points;
      const better2 = s2.points > s1.points;
      rows.push({ label: 'Points', value1: Math.round(s1.points), value2: Math.round(s2.points), better1, better2 });
    }
    if (enabledMetrics.sprintWins) {
      const better1 = s1.sprintWins > s2.sprintWins;
      const better2 = s2.sprintWins > s1.sprintWins;
      rows.push({ label: 'Sprint Wins', value1: s1.sprintWins, value2: s2.sprintWins, better1, better2 });
    }
    if (enabledMetrics.sprintPodiums) {
      const better1 = s1.sprintPodiums > s2.sprintPodiums;
      const better2 = s2.sprintPodiums > s1.sprintPodiums;
      rows.push({ label: 'Sprint Podiums', value1: s1.sprintPodiums, value2: s2.sprintPodiums, better1, better2 });
    }
    if (enabledMetrics.dnfs) {
      const better1 = s1.dnfs < s2.dnfs;
      const better2 = s2.dnfs < s1.dnfs;
      rows.push({ label: 'DNFs', value1: s1.dnfs, value2: s2.dnfs, better1, better2 });
    }
    if (enabledMetrics.poles && useYearStats && 'poles' in s1 && 'poles' in s2) {
      const better1 = (s1 as any).poles > (s2 as any).poles;
      const better2 = (s2 as any).poles > (s1 as any).poles;
      rows.push({ label: 'Pole Positions', value1: (s1 as any).poles, value2: (s2 as any).poles, better1, better2 });
    }

    return rows;
  }, [pdfDriver1, pdfDriver2, stats1, stats2, enabledMetrics]);

  // Export function with image loading wait
  const handleExportPdf = async () => {
    if (!pdfCardRef.current || !pdfDriver1 || !pdfDriver2) {
      console.error('Missing required data for PDF export:', { pdfCardRef: !!pdfCardRef.current, pdfDriver1: !!pdfDriver1, pdfDriver2: !!pdfDriver2 });
      return;
    }

    try {
      // Give time for images to load (base64 conversion happens in useEffect)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Wait for images to be in DOM
      const images = pdfCardRef.current.querySelectorAll('img');
      
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve<void>(undefined);
          return new Promise<void>((resolve) => {
            img.onload = () => resolve(undefined);
            img.onerror = () => resolve(undefined);
            setTimeout(() => resolve(undefined), 3000);
          });
        })
      );

      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(pdfCardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: pdfCardRef.current.offsetWidth,
        height: pdfCardRef.current.offsetHeight,
      });

      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      
      // If image is taller than page, scale down to fit
      if (imgH > pageH) {
        const scale = pageH / imgH;
        const scaledW = imgW * scale;
        const scaledH = pageH;
        const x = (pageW - scaledW) / 2;
        pdf.addImage(img, "PNG", x, 0, scaledW, scaledH, undefined, "FAST");
      } else {
        const y = (pageH - imgH) / 2;
        pdf.addImage(img, "PNG", 0, y, imgW, imgH, undefined, "FAST");
      }

      const driver1Name = pdfDriver1.fullName.replace(/\s+/g, '_');
      const driver2Name = pdfDriver2.fullName.replace(/\s+/g, '_');
      const yearSuffix = selection1 && selection1.year !== 'career' ? `_${selection1.year}` : '';
      pdf.save(`RaceIQ_${driver1Name}_vs_${driver2Name}${yearSuffix}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Check console for details or try using different drivers.');
    }
  };





  if (!isAuthenticated) {
    return (
      <Flex direction="column" align="center" justify="center" minH="60vh" gap={4} p="xl">
        <Heading size="md" fontFamily="heading">Login to Compare Drivers</Heading>
        <Text color="text-secondary">Please sign in to access the comparison tool.</Text>
        <Button
          bg="brand.red"
          _hover={{ bg: 'brand.redDark' }}
          color="white"
          onClick={() => loginWithRedirect()}
        >
          Login
        </Button>
      </Flex>
    );
  }

  return (
    <Box>
      <PageHeader 
        title="Driver Comparison" 
        subtitle="Compare F1 drivers head-to-head"
      />
      <Box p={{ base: 'md', md: 'xl' }}>

      {error && <Text color="brand.red" textAlign="center" fontSize="lg" p="xl">{error}</Text>}

      {/* Driver Selection Grid - Always visible */}
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr auto 1fr' }}
        gap="lg"
        mb="xl"
        alignItems="flex-start"
      >
        <DriverSelectionPanel
          title="Driver 1"
          allDrivers={driverOptions}
          selectedDriverData={driver1}
          onDriverSelect={(id) => {
            const driverId = String(id);
            handleSelectDriver(1, driverId); // Fetch basic driver info with team
            selectDriver(1, driverId, 'career'); // Fetch comparison stats
          }}
          isLoading={loading}
          // NEW: Year selection support - using simplified controls in panel
          extraControl={null}
        />

        <Flex
          align="center"
          justify="center"
          h={{ base: '60px', lg: '150px' }}
          display={{ base: 'flex', lg: 'flex' }}
        >
          <Heading size={{ base: 'xl', lg: '3xl' }} color="brand.red" fontFamily="heading">
            VS
          </Heading>
        </Flex>

        <DriverSelectionPanel
          title="Driver 2"
          allDrivers={driverOptions}
          selectedDriverData={driver2}
          onDriverSelect={(id) => {
            const driverId = String(id);
            handleSelectDriver(2, driverId); // Fetch basic driver info with team
            selectDriver(2, driverId, 'career'); // Fetch comparison stats
          }}
          isLoading={loading}
          // NEW: Year selection support - using simplified controls in panel  
          extraControl={null}
        />
      </Grid>

      {/* Loading Spinner - Below driver selection cards */}
      {loading && <F1LoadingSpinner text="Loading comparison data..." />}

      {/* Comparison Table - Only show when both drivers are selected and not loading */}
      {driver1 && driver2 && !loading && (
        <>
        <ComparisonTable 
          driver1={driver1} 
          driver2={driver2} 
          // NEW: Pass additional stats for enhanced comparison
          stats1={stats1}
          stats2={stats2}
          enabledMetrics={enabledMetrics}
          selection1={selection1}
          selection2={selection2}
          score={score}
          // NEW: Pass handlers for the updated filter styling
          onYearChange={(driverIndex, year) => {
            const driverId = driverIndex === 1 ? selection1?.driverId : selection2?.driverId;
            if (driverId) {
              selectDriver(driverIndex, driverId, year);
            }
          }}
          onMetricToggle={toggleMetric}
          availableYears={years}
        />

          {/* PDF Export Button */}
          <Box mt="lg" textAlign="center">
            <Button
              leftIcon={<Download />}
              bg="brand.red"
              color="white"
              _hover={{ bg: 'brand.redDark', transform: 'translateY(-2px)' }}
              _active={{ transform: 'translateY(0px)' }}
              size="lg"
              fontFamily="heading"
              fontWeight="bold"
              boxShadow="0 4px 12px rgba(225, 6, 0, 0.3)"
              transition="all 0.2s"
              onClick={handleExportPdf}
              isDisabled={comparisonRows.length === 0}
            >
              Export as PDF
            </Button>
          </Box>

          {/* Hidden PDF Comparison Card for export */}
          {pdfDriver1 && pdfDriver2 && (
            <Box
              position="absolute"
              left="-9999px"
              top="-9999px"
              id="pdf-export-card"
            >
              <PdfComparisonCard
                ref={pdfCardRef}
                driver1={{
                  fullName: pdfDriver1.fullName,
                  imageUrl: pdfDriver1.imageUrl,
                  teamColorToken: pdfDriver1.teamColorToken,
                  teamColorHex: pdfDriver1.teamColorToken
                }}
                driver2={{
                  fullName: pdfDriver2.fullName,
                  imageUrl: pdfDriver2.imageUrl,
                  teamColorToken: pdfDriver2.teamColorToken,
                  teamColorHex: pdfDriver2.teamColorToken
                }}
                rows={comparisonRows}
              />
            </Box>
          )}
        </>
      )}
      </Box>
    </Box>
  );
};

export default CompareDriversPage;
