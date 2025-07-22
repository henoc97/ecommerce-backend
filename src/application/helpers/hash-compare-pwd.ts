import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        // Log détaillé pour le debug
        console.error('Erreur réelle lors du hachage du mot de passe:', error);
        throw new Error('Erreur lors du hachage du mot de passe');
    }
};

export const comparePassword = async (password: string, passwordHashed: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(password, passwordHashed);
    } catch (error) {
        // Log détaillé pour le debug
        console.error('Erreur réelle lors de la comparaison des mots de passe:', error);
        throw new Error('Erreur lors de la comparaison des mots de passe');
    }
};

// Si le problème persiste, installer bcryptjs et remplacer l'import par :
// import bcrypt from 'bcryptjs';

