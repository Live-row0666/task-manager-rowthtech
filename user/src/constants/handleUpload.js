// handleUpload.js
import axios from 'axios';


export const handleUpload = async (file, setLoading) => {
    if (!file) {
        alert('Please select a file first');
        return null;
    }
    setLoading(true);
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/s3/get-presigned-url`, {
            params: {
                fileName: file.name,
                fileType: file.type,
            },
        });

        // Extract the URL
        let url = response.data;
        // url = JSON.parse(url);
        // if (!url) {
        //     console.error('No URL returned in response data:', response.data);
        //     return null;
        // }

        // if (url && typeof url === 'string') {
        //     const directUrl = url.split('?')[0];  // Safe to call split() after checking if url is defined
        // } else {
        //     console.error('URL is undefined or not a valid string');
        // }

        // const finalurl = url["url"].split('?')[0];

        // Upload the file to S3 using the pre-signed URL

        // const uploadResponse = await axios.put(url?.url, file, {
        //     headers: {
        //         'Content-Type': file.type,
        //     },
        // });

        const uploadResponse = await fetch(url?.url, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        });
        // if (uploadResponse.status === 200) {
        //     return url; // Ensure this line returns the URL correctly
        // } else {
        //     console.error('File upload failed with status:', uploadResponse.status);
        //     return null;
        // }

        return url;

    } catch (error) {
        console.error('Error uploading file:', error);
        return null;
    } finally {
        setLoading(false)
    }
};