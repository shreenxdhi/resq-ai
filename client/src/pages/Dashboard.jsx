import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Components
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PlanModal from '../components/PlanModal';

// Hooks
import { useAuth } from '../utils/AuthContext';

// Utils & Data
import { countries, riskZones } from '../utils/mockData';

// Lazy load heavy components
const MapView = lazy(() => import('../components/MapView').then(module => ({ default: module.MapView })));
const { Marker, Popup } = lazy(() => import('react-leaflet').then(module => ({
  Marker: module.Marker,
  Popup: module.Popup
})));

// Import marker icons and components from MapView
import { markerIcons, ChangeMapView } from '../components/MapView';

// Dynamic import for leaflet CSS
const Dashboard = () => {
  const { user, loading } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [mapCenter, setMapCenter] = useState([20, 0]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet/dist/leaflet.css');
    }
  }, []);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    // Update map center based on selected country
    const countryData = countries.find(c => c.name === country);
    if (countryData && countryData.coordinates) {
      setMapCenter(countryData.coordinates);
    }
  };

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setShowPlanModal(true);
  };

  if (loading) {
    return <Skeleton height="100vh" />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const filteredZones = useMemo(() => {
    if (!selectedCountry) return [];
    return riskZones.filter(zone => zone.country === selectedCountry);
  }, [selectedCountry]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Disaster Risk Assessment</h1>
          
          {/* Country Selection */}
          <div className="mb-6">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Select Country
            </label>
            <select
              id="country"
              value={selectedCountry}
              onChange={handleCountryChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Map View */}
          <div className="h-96 mb-6 rounded-lg overflow-hidden border">
            <Suspense fallback={<Skeleton height="100%" />}>
              <MapView center={mapCenter} zoom={selectedCountry ? 6 : 2}>
                <ChangeMapView center={mapCenter} />
                
                {/* Render markers for risk zones */}
                {filteredZones.map((zone) => (
                  <Marker
                    key={`${zone.lat}-${zone.lng}`}
                    position={[zone.lat, zone.lng]}
                    icon={markerIcons[zone.riskLevel] || markerIcons.default}
                    eventHandlers={{
                      click: () => handleZoneSelect(zone)
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <h3 className="font-bold">{zone.name}</h3>
                        <p>Risk: {zone.riskLevel}</p>
                        <button
                          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => handleZoneSelect(zone)}
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapView>
            </Suspense>
          </div>

          {/* Risk Zones List */}
          {selectedCountry && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Risk Zones in {selectedCountry}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleZoneSelect(zone)}
                  >
                    <h3 className="font-medium">{zone.name}</h3>
                    <div className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      zone.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      zone.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {zone.riskLevel} risk
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Plan Modal */}
      {showPlanModal && (
        <Suspense fallback={null}>
          <PlanModal
            isOpen={showPlanModal}
            onClose={() => setShowPlanModal(false)}
            zone={selectedZone}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Dashboard;
