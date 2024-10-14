module.exports = async (client) => {
    console.log(`> Connecté: ${client.user.tag}`);
    client.user.setActivity(`?????`);

    const ownerIds = process.env.OWNER_IDS.split(',');

    for (const ownerId of ownerIds) {
        try {
            const [result] = await client.db.promise().query(
                'INSERT INTO bot_owners (user_id, is_owner) VALUES (?, true) ON DUPLICATE KEY UPDATE is_owner = true',
                [ownerId]
            );
            if (result.affectedRows > 0) {
                console.log(`Propriétaire mis à jour/ajouté : ${ownerId}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du propriétaire ${ownerId}:`, error);
        }
    }

    console.log('Tous les propriétaires ont été mis à jour dans la base de données.');
};