import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { GetIpfsUrlFromPinata } from '../../utils';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import Chip from "@mui/material/Chip";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';


export default function RentCard(props) {
    const { auth, setAuth } = useAuth();
    const [time, setTime] = useState(0);

    useEffect(() => {
        const calculateTime = async () => {
            const currentTime = await auth.contract.time();
            setTime(parseInt(currentTime));
        };
        calculateTime();
    }, [props.property, auth.contract]);

    useEffect(() => {
        // Create a countdown timer
        let countdownInterval;

        if (props.property[1] && time) {
            countdownInterval = setInterval(() => {
                const endTime = parseInt(props.property[1]);
                const remainingTime = endTime - time - 1; // Decrease time by 1 second
                setTime(time + 1); // Update the time
            }, 1000); // Update the timer every second
        }

        return () => {
            // Clear the interval when the component unmounts
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [props.property[1], time]);

    return (
        <Card sx={{ height: 430, width: 400, padding: '0.5rem' }}>
            <CardMedia
                sx={{ height: 250 }}
                // eslint-disable-next-line react/prop-types
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
                    <Typography variant="body2" color="text.secondary">
                        {time && props.property[1] ? props.property[1] - time : 0}
                    </Typography>
                </div>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Chip icon={<CurrencyRupeeIcon />} label={`${props.property[4]}`} color='primary' />
            </CardActions>
        </Card>
    );
}
