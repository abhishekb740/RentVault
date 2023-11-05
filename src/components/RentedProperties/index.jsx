import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/auth'
import { Paper } from '@mui/material';
import RentCard from '../RentCard';
import Loader from '../Loader';

const RentedProfile = () => {
    const [properties, setProperties] = useState([]);
    const [balance, setBalance] = useState(0);
    const {auth, setAuth} = useAuth();
    const [loader, setLoader] = useState(false);
    useEffect(()=>{
        const getUserProperties = async() =>{
            let contract = auth.contract;
            let properties = await contract.getRentedProperties(auth.accountAddr);
            console.log(properties);
            setProperties(properties);
            let _balance = await contract.getUserBalance();
            setBalance(parseInt(_balance));;
        }
        getUserProperties();
    },[])
  return (
    <div style={{display: 'flex', flexDirection: 'column'}} >
      {loader && <Loader/>}
      <Paper sx={{ display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between', 
          gap: 2,
          width: '100%',
          minHeight: '60vh',
          boxShadow: 'none',
          padding: '1rem',
          // marginTop: '3rem',
        }} >
        {properties.map((property, index) => {
          // let time = parseInt(await auth.contract.time()); // Convert time to an integer
          // console.log("Time: ", parseInt(time));
        
          // let endTime = parseInt(property[1]);
          // console.log("End Time: ", parseInt(endTime));
        
          // let timeDifference = endTime - time;
          // console.log("Time Difference: ", parseInt(timeDifference));
          return (
            <RentCard key={parseInt(property[6])} property={property}/>
          )
        })}
      </Paper>
      
    </div>
  )
}

export default RentedProfile