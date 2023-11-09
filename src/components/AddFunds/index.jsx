import { TextField, Button, Paper, Typography } from '@mui/material';
import { useAuth } from '../../context/auth';
import { useEffect, useState } from 'react';

const AddFunds = () => {
    const { auth, setAuth } = useAuth();
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState(0);
    const changeHandler = async (e) => {
        setAmount(e.target.value);
    }
    useEffect(()=>{
        const getBalance = async () => {
            let contract = auth.contract;
            let bal = await contract.getUserBalance();
            console.log(parseInt(bal));
            setBalance(parseInt(bal));
        }
        getBalance();
    },[])
    const submitHandler = async (e) => {
        let contract = auth.contract;
        let tx = await contract.addUserBalance(amount);
        await tx.wait();
        alert("Funds Added Successfully");
    }
    return (
        <Paper sx={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '70%', minHeight: '40vh' }} >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4rem' }} >
                <div style={{ fontSize: '30px' }} >
                    Add Funds to your Account
                </div>
                <Typography sx={{fontSize: '30px'}} >
                    Your Balance: {balance}
                </Typography>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }} >
                <TextField onChange={changeHandler} sx={{}} placeholder='Enter the Amount' />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}  >
                <Button style={{ width: '30%', border: '1px solid black' }} onClick={submitHandler} >Add Funds</Button>
            </div>
        </Paper>
    )
}

export default AddFunds