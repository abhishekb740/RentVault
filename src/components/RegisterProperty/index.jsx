import { Container, Paper, TextField, Typography, Button, styled } from "@mui/material";
import BusinessIcon from '@mui/icons-material/Business';
import { useState } from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useAuth } from "../../context/auth";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../pinata";
import ModalComponet from "../Modal"
import Loader from "../Loader";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        propertyName: "",
        location: "",
        price: "",
        imageHash: ""
    })
    const [fileURL, setFileURL] = useState(null);
    const [file, setFile] = useState(null);
    const { auth, setAuth } = useAuth();
    const [message, setMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [loader, setLoader] = useState(false);

    console.log(auth);
    const handleChangeFormData = (event) => {
        setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }))
    }
    // const submitHandler = async (e) => {
    //     e.preventDefault();
    //     console.log("Hello");
    //     console.log(formData);
    //     console.log(auth.contract);
    //     let contract = auth.contract;
    //     try {
    //         let transaction = await contract.registerOrganization(formData.propertyName, formData.location, formData.price, formData.imageHash);
    //         await transaction.wait();
    //         alert("Successfully registered");
    //     }
    //     catch (e) {
    //         alert(e.reason);
    //     }
    //     setFormData({
    //         propertyName: "",
    //         location: "",
    //         price: "",
    //         imageHash: ""
    //     })
    //     console.log("Working");
    // }

    const handleChangeFile = async (e) => {
        try {
            setLoader(true);
            console.log(e.target.files[0]);
            console.log(URL.createObjectURL(e.target.files[0]));
            setFileURL(URL.createObjectURL(e.target.files[0]));
            const response = await uploadFileToIPFS(e.target.files[0]);
            if (response.success === true) {
                setFile(response.pinataURL);
            }
            console.log("Uploaded file to pinata", response);
            setLoader(false);
            alert("Image uploaded successfully");
        }
        catch (e) {
            console.log("Error during File upload: ", e);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("Are you sure you want to Submit?");
        setOpen(true);
    }

    async function uploadMetadataToIPFS() {
        if (!file) {
            console.log("name or fileURL not set", formData.propertyName, file);
            return;
        }
        const nftJSON = {
            propertyName: formData.propertyName,
            image: file,
            location: formData.location,
            price: formData.price,
        };
        try {
            const response = await uploadJSONToIPFS(nftJSON);
            if (response.success === true) {
                console.log("Uploaded json to pinata", response);
                setLoader(false);
                return response.pinataURL;
            }
        }
        catch (e) {
            setLoader(false);
            alert("Error uploading JSON metadata", e);
        }
    }

    const finalSubmit = async () => {
        setOpen(false);
        let contract = auth.contract;
        try {
            const metaDataURL = await uploadMetadataToIPFS();
            let transaction = await contract.mint(formData.propertyName, formData.location, formData.price, file);
            await transaction.wait();
            setLoader(false);
            alert("Successfully minted the Property");
        }
        catch (e) {
            console.log(e);
            setLoader(false);
            alert(e.reason);

        }
    }

    return (
        <Container
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100%",
                flexDirection: "column",
                width: "60%",
                gap: "1rem",
            }}
        >
            {loader ? <Loader /> : <Paper
                sx={{
                    padding: "1.5rem",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    borderRadius: "1rem"
                }}
            >
                <form>
                    <Container
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingBottom: "2rem",
                            textAlign: "center"
                        }}
                    >
                        <BusinessIcon fontSize="large" color="primary" />
                        <Typography variant="h5" component="div" fontWeight={600} fontSize={18}>Register your Property for Rent</Typography>
                    </Container>
                    <Container
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            gap: "1rem"
                        }}
                    >
                        <TextField
                            placeholder="Property Name"
                            fullWidth
                            label="Property Name"
                            name="propertyName"
                            required
                            onChange={handleChangeFormData}
                            value={formData.propertyName}
                        />
                        <TextField
                            placeholder="Price"
                            label="Price"
                            fullWidth
                            name="price"
                            required
                            onChange={handleChangeFormData}
                            value={formData.price}
                        />
                        <TextField
                            placeholder="Address"
                            label="Address"
                            fullWidth
                            multiline
                            rows={3}
                            name="location"
                            required
                            onChange={handleChangeFormData}
                            value={formData.location}
                        />
                        <Button component="label" variant="contained" startIcon={<ArrowUpwardIcon />}>
                            Upload Image
                            <VisuallyHiddenInput
                                type="file"
                                accept="image/"
                                max={524288}
                                onChange={handleChangeFile}
                            />
                        </Button>
                    </Container>
                    <Container>
                        <Button type="submit" variant="contained" fullWidth onClick={handleSubmit} >
                            Register
                        </Button>
                    </Container>
                </form>
            </Paper>}
            <ModalComponet finalSubmit={finalSubmit} open={open} setOpen={setOpen} message={message} setLoader={setLoader} loader={loader} />
        </Container >
    )
}