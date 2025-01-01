"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// 動的に地図をロード
const CountryDisasterMap = dynamic(() => import("./CountryDisasterMap"), {
  ssr: false,
});

const CountryDisasters: React.FC = () => {
  const [country, setCountry] = useState<string | null>(null);
  const path = usePathname();
  const [disasters, setDisasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const countryPath = path.replace("/voyager/", "");
    setCountry(countryPath);
  }, [path]);

  useEffect(() => {
    if (!country) return;
    if (disasters && disasters.length > 0) return;

    const fetchDisasters = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch disaster data for the specified country
        const res = await fetch(`/data/voyager/latest/${country}/data.geojson`);

        if (!res.ok) {
          throw new Error("Failed to fetch disaster data");
        }

        const data = await res.json();
        setDisasters(data.features);
      } catch (err) {
        console.error(err);
        setError("Failed to load data for the selected country.");
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
  }, [country]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (disasters.length === 0)
    return <p>No ongoing disasters found for {country}</p>;

  return (
    <div
      style={{
        color: "white",
      }}
    >
      <h1>Ongoing Disasters in {country}</h1>
      <ul>
        {disasters.map((disaster) => (
          <li key={disaster.properties.id}>
            <h2>{disaster.properties.name}</h2>
            <details>
              <summary style={{ cursor: "pointer" }}>
                <strong>Description:</strong>
              </summary>
              <p style={{ marginTop: "10px" }}>
                {disaster.properties.description}
              </p>
            </details>
            <p>
              <strong>Changed:</strong>{" "}
              {new Date(disaster.properties.changedDate).toLocaleString()}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(disaster.properties.createdDate).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
      <div style={{ width: "100%", height: "400px" }}>
        <CountryDisasterMap disasters={disasters} />
      </div>
    </div>
  );
};

export default CountryDisasters;
