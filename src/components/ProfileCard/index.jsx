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
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';



export default function ProfileCard(props) {
    const { auth, setAuth } = useAuth();
    const [loader, setLoader] = useState(false);
    return (
        <div><Card sx={{ height: 430, width: 400, padding: '0.5rem' }}>
            <CardMedia
                sx={{ height: 250 }}
                image={GetIpfsUrlFromPinata(props.property[5])}
                title="green iguana"
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {props.property[2]}
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                        {props.property[3]}
                    </Typography>
                </div>
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }} >
                <Chip icon={<CurrencyRupeeIcon />} label={`${props.property[4]}`} color='primary' />
            </CardActions>
        </Card>
        </div>

    );
}

