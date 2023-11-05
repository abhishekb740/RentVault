import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/auth'
import { Paper } from '@mui/material';
import ProfileCard from '../ProfileCard';
import Loader from '../Loader';

const Profile = () => {
  const [properties, setProperties] = useState([]);
  const [balance, setBalance] = useState(0);
  const { auth, setAuth } = useAuth();
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    const getUserProperties = async () => {
      setLoader(true)
      let contract = auth.contract;
      let properties = await contract.getUserProperties();
      console.log(properties);
      setProperties(properties);
      let _balance = await contract.getUserBalance();
      setBalance(parseInt(_balance));
      setLoader(false);
    }
    getUserProperties();
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }} >
      {loader ? <Loader /> : <Paper sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 2,
        width: '100%',
        // minHeight: '60vh',
        boxShadow: 'none',
        padding: '1rem',
        // marginTop: '3rem',
      }} >
        {properties.map((property, index) => {
          return (
            <ProfileCard style={{ flex: '0 0 33.33%', padding: '8px' }} key={parseInt(property[6])} property={property} />
          )
        })}
      </Paper>}

    </div>
  )
}

export default Profile