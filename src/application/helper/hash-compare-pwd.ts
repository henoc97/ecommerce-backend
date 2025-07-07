import bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        // Gérer l'erreur ici (par exemple, journaliser l'erreur)
        throw new Error('Erreur lors du hachage du mot de passe');
    }
};

export const comparePassword = async (password: string, passwordHashed: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(password, passwordHashed);
    } catch (error) {
        // Gérer l'erreur ici (par exemple, journaliser l'erreur)
        throw new Error('Erreur lors de la comparaison des mots de passe');
    }
};

