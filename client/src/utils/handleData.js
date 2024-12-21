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


export const loadEmotions = async (apiUrl) => {
    try {
        const response = await fetch(`${apiUrl}/api/load-emotions`);
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

export const loadNeeds = async (apiUrl) => {
    try {
        const response = await fetch(`${apiUrl}/api/load-needs`);
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

export const storeEmotions = async (apiUrl, userId, emotions, type) => {
    try {
        const response = await fetch(`${apiUrl}/api/emotions/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emotions: emotions,
                type: type
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error storing emotions:', error);
        throw error;
    }
};

export const storeNeeds = async (apiUrl, userId, needs) => {
    try {
        const response = await fetch(`${apiUrl}/api/needs/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                needs: needs
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error storing needs:', error);
        throw error;
    }
};