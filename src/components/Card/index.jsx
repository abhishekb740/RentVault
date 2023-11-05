import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { GetIpfsUrlFromPinata } from '../../utils';
import ModalComponent from '../Modal';
import { useState } from 'react';
import { useAuth } from '../../context/auth';
import { TextField } from '@mui/material';
import Chip from "@mui/material/Chip";
import Loader from "../Loader";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';


export default function MediaCard(props) {
    const { auth, setAuth } = useAuth();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);
    const [expires, setExpires] = useState(0);
    const submitHandler = async (e) => {
        // setLoader(true);
        setMessage("Rent this Room?")
        setOpen(true);

    }
    const finalSubmit = async (tokenId, price) => {
        setOpen(false);
        setMessage("");
        // if(expires!==0){
        let seconds = await auth.contract.time();
        // console.log(expires);
        // alert(expires);
        let _expires = Math.floor(new Date().getTime() / 1000) + parseInt(expires, 10);
        console.log(expires);
        console.log("Expires At: ", _expires);
        console.log("Start: ", parseInt(seconds));
        // let time = seconds + 120;
        // console.log(time);
        // let _user = await auth.contract.userOf(0);
        // alert(_user);
        let tx = await auth.contract.rentProperty(tokenId, auth.accountAddr, _expires, price);
        await tx.wait();
        setLoader(false);
        alert("Rent Success");
    }

    const changeHandler = (e) => {
        setExpires(e.target.value);
    }
    return (
        <div>
            {loader ? <Loader /> : <Card sx={{ height: 450, width: 400, padding: '0.5rem' }}>
                <CardMedia
                    sx={{ height: 250 }}
                    image={GetIpfsUrlFromPinata(props.property[5])}
                    title="green iguana"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        {props.property[2]}
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {props.property[3]}
                        </Typography>
                        <TextField onChange={changeHandler} placeholder='No of Seconds' />
                    </div>
                </CardContent>
                <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }} >
                    <Chip icon={<CurrencyRupeeIcon/>} label={`${props.property[4]}`} color='primary' />
                    <Button onClick={submitHandler} >Rent Property</Button>
                </CardActions>
                <ModalComponent finalSubmit={() => finalSubmit(parseInt(props.property[6]), parseInt(props.property[4]))} open={open} setOpen={setOpen} message={message} />
            </Card>}
        </div>
    );
}

