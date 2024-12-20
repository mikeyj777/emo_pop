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
    console.info('in loadEmotions');
    try {
        console.info('loading emotions...');
        console.info("logging in. url is " + apiUrl);
        console.info("full url as interpreted by react is " + `${apiUrl}/api/load-emotions`);
      
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
    console.info('in loadNeeds');
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