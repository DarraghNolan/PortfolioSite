import axios from 'axios';

// Set the base URL for Axios
// axios.defaults.baseURL = process.env.VUE_APP_BASE_URL || 'http://localhost:8800';

axios.defaults.baseURL = process.env.VUE_APP_BASE_URL || 'https://incidentrackerheroku-f9b4e6122ea4.herokuapp.com';

export default axios;