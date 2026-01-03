const STORAGE_KEY = 'protask_data';

const Storage = {
    save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },
    load() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }
};