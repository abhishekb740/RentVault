import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { CssBaseline, Paper } from "@mui/material";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import { useState } from "react";
// import IssueCertificatePage from "./issue-certificate";
// import IssuedCertificatesPage from "./issued-certificates";
import Layout from "./layout";
import RegisterPage from "../components/RegisterProperty"
import PropertyList from '../components/ListOfProperties';
import Profile from '../components/Profile';
import RentedProfile from '../components/RentedProperties';
import Loader from '../components/Loader';
import AddFunds from '../components/AddFunds';

const panels = {
    "Register Property": <RegisterPage />,
    "Rent a Property": <PropertyList />,
    "User Profile": <Profile />,
    "Rented Properties": <RentedProfile />,
    "Add Funds": <AddFunds />,
}

export default function IndexPage() {

    const [value, setValue] = useState(Object.keys(panels)[0]);
    const handleChange = (_, newValue) => {
        setValue(newValue);
    };

    return (
        <Layout>
            <CssBaseline/>
            <Box sx={{ width: '100%', typography: 'h2' }} >
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: "center" }}>
                        <TabList onChange={handleChange}>
                            {Object.keys(panels).map(e => (
                                <Tab key={e} label={e} value={e} />
                            ))}
                        </TabList>
                    </Box>
                    {Object.keys(panels).map(e => (
                        <TabPanel key={e} value={e}>
                            <Paper
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    // height: "80vh",
                                    paddingTop: "2rem",
                                    width: "100%",
                                    background: "inherit",
                                    boxShadow: 'none',
                                }}
                            >
                                {panels[e]}
                            </Paper>
                        </TabPanel>
                    ))}
                </TabContext>
            </Box>
        </Layout>
    )
}