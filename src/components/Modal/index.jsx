import React, { useEffect } from 'react'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const ModalComponent = (props) => {
    const handleClose = () => props.setOpen(false);
    return (
        <Modal
            open={props.open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {props.message}
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    <Button onClick={props.finalSubmit}>
                        Yes
                    </Button>
                    <Button onClick={() => props.setOpen(false)} >
                        No
                    </Button>
                </Typography>
            </Box>
        </Modal>
    )
}

export default ModalComponent