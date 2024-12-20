/*

pull data from the following tables:

postgres=# -- Create emotions table
postgres=# CREATE TABLE emotions (
postgres(#   id SERIAL PRIMARY KEY,
postgres(#   header VARCHAR(255) NOT NULL,
postgres(#   name VARCHAR(255) NOT NULL,
postgres(#   is_positive BOOLEAN NOT NULL
postgres(# );
        
postgres=# CREATE TABLE needs (
postgres(#   id SERIAL PRIMARY KEY,
postgres(#   header VARCHAR(255) NOT NULL,
postgres(#   name VARCHAR(255) NOT NULL
postgres(# );
CREATE TABLE

*/

// api.js or similar file
const API_BASE_URL = process.env.API_URL;

export const loadEmotions = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/load-emotions`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading emotions:', error);
        throw error;
    }
};

export const loadNeeds = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/load-needs`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading needs:', error);
        throw error;
    }
};