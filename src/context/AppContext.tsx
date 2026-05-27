'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserProfile, Scenario, RunResults, runSimulation } from '@/utils/simulation';
import { defaultProfile, defaultScenarios, predefinedPaths } from '@/utils/mockData';

interface AppContextType {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
  scenarios: Scenario[];
  updateScenario: (id: string, variables: Partial<Scenario['variables']>) => void;
  toggleScenario: (id: string) => void;
  setScenarios: (scenarios: Scenario[]) => void;
  activePath: string;
  selectPredefinedPath: (pathName: string) => void;
  results: RunResults;
  compareResults: { [pathName: string]: RunResults };
  resetAll: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [scenarios, setScenariosState] = useState<Scenario[]>(defaultScenarios);
  const [activePath, setActivePath] = useState<string>("Current Path");
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('lifesim_profile');
      const storedScenarios = localStorage.getItem('lifesim_scenarios');
      const storedPath = localStorage.getItem('lifesim_active_path');

      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedScenarios) setScenariosState(JSON.parse(storedScenarios));
      if (storedPath) setActivePath(storedPath);
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage when state changes
  const saveState = (newProfile: UserProfile, newScenarios: Scenario[], newPath: string) => {
    try {
      localStorage.setItem('lifesim_profile', JSON.stringify(newProfile));
      localStorage.setItem('lifesim_scenarios', JSON.stringify(newScenarios));
      localStorage.setItem('lifesim_active_path', newPath);
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveState(newProfile, scenarios, activePath);
  };

  const setScenarios = (newScenarios: Scenario[]) => {
    setScenariosState(newScenarios);
    saveState(profile, newScenarios, activePath);
  };

  const updateScenario = (id: string, variables: Partial<Scenario['variables']>) => {
    const updated = scenarios.map((sc) => {
      if (sc.id === id) {
        return {
          ...sc,
          variables: {
            ...sc.variables,
            ...variables,
          },
        };
      }
      return sc;
    });
    setScenariosState(updated);
    saveState(profile, updated, activePath);
  };

  const toggleScenario = (id: string) => {
    const updated = scenarios.map((sc) => {
      if (sc.id === id) {
        return { ...sc, isEnabled: !sc.isEnabled };
      }
      return sc;
    });
    setScenariosState(updated);
    
    // Custom toggle breaks predefined path alignment, label it as Custom
    let newPath = activePath;
    if (activePath !== "Custom Simulation") {
      newPath = "Custom Simulation";
      setActivePath(newPath);
    }
    saveState(profile, updated, newPath);
  };

  const selectPredefinedPath = (pathName: string) => {
    const targetPath = predefinedPaths.find((p) => p.name === pathName);
    if (!targetPath) return;

    const updatedScenarios = scenarios.map((sc) => ({
      ...sc,
      isEnabled: targetPath.scenarioIds.includes(sc.id),
    }));

    setScenariosState(updatedScenarios);
    setActivePath(pathName);
    saveState(profile, updatedScenarios, pathName);
  };

  const resetAll = () => {
    setProfile(defaultProfile);
    setScenariosState(defaultScenarios);
    setActivePath("Current Path");
    try {
      localStorage.removeItem('lifesim_profile');
      localStorage.removeItem('lifesim_scenarios');
      localStorage.removeItem('lifesim_active_path');
    } catch (e) {
      console.error(e);
    }
  };

  // Precompute current active results
  const results = useMemo(() => {
    return runSimulation(profile, scenarios);
  }, [profile, scenarios]);

  // Precompute compare results for all 5 default paths
  const compareResults = useMemo(() => {
    const resultsMap: { [pathName: string]: RunResults } = {};
    predefinedPaths.forEach((path) => {
      // Map active scenarios for this path
      const pathScenarios = defaultScenarios.map((sc) => ({
        ...sc,
        isEnabled: path.scenarioIds.includes(sc.id),
      }));
      resultsMap[path.name] = runSimulation(profile, pathScenarios);
    });
    return resultsMap;
  }, [profile]);

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        scenarios,
        updateScenario,
        toggleScenario,
        setScenarios,
        activePath,
        selectPredefinedPath,
        results,
        compareResults,
        resetAll,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppStateProvider');
  }
  return context;
}
