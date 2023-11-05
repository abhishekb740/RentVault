import { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth';
import MediaCard from '../Card';
import { Paper } from '@mui/material';
import Loader from "../Loader";

const PropertyList = () => {
  const [loader, setLoader] = useState(false);
  const { auth } = useAuth();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    async function getProperties() {
      setLoader(true);
      console.log(auth.contract);
      let contract = auth.contract;
      let properties = await contract.allAvailableRentingProperties();
      console.log(properties);
      setProperties(properties);
      setLoader(false);
    }
    getProperties();
  }, [auth.contract]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {loader ? (
        <Loader />
      ) : (
        <Paper
          sx={{
            display: 'flex',
            width: '100%',
            padding: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {properties.map((property) => {
            return (
              <div key={parseInt(property[6])} style={{ flex: '0 0 33.33%', padding: '8px' }}>
                <MediaCard property={property} />
              </div>
            );
          })}
        </Paper>
      )}
    </div>
  );
};

export default PropertyList;
