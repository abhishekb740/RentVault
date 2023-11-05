import lighthouse from '@lighthouse-web3/sdk';

const RegisterProperty = () => {
    const progressCallback = (progressData) => {
        let percentageDone =
            100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
        console.log(percentageDone);
    };
    
    const uploadFile = async (file) => {
        // Push file to lighthouse node
        // Both file and folder are supported by upload function
        // Third parameter is for multiple files, if multiple files are to be uploaded at once make it true
        // Fourth parameter is the deal parameters, default null
        const output = await lighthouse.upload(file, "eea578f0.cf6e6b4e2e0345e5847cf880cc3811fd", false, null, progressCallback);
        console.log('File Status:', output);
        /*
          output:
            data: {
              Name: "filename.txt",
              Size: 88000,
              Hash: "QmWNmn2gr4ZihNPqaC5oTeePsHvFtkWNpjY3cD6Fd5am1w"
            }
          Note: Hash in response is CID.
        */

        console.log('Visit at https://gateway.lighthouse.storage/ipfs/' + output.data.Hash);
    }

    const RetriveUploads = async() =>{
        const apiKey = 'eea578f0.cf6e6b4e2e0345e5847cf880cc3811fd'; // Make sure to replace with your public key
        const uploads = await lighthouse.getUploads(apiKey);

        // Display the list of uploaded files
        console.log(uploads);
    }

    return (
        <>
        Register Your Property
        </>
    );
}

export default RegisterProperty