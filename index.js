const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const GOD_BOT_ID = "1521044059643318443"; 

let defaultTrigger = "!pai";
let customPrefix = "";

// 📦 Settings Server / User
const serverSettings = new Map();

function getServerConfig(guildId) {
    if (!serverSettings.has(guildId)) {
        serverSettings.set(guildId, {
            owoMsg: "owo 🥳",
            huntMsg: "hunt/battle 🎉",
            prayMsg: "pray/curse 🙏",
            owoPrefix: "w",
            botPrefix: "!pai",
            useDefaultPrefix: true
        });
    }
    return serverSettings.get(guildId);
}

const userSettings = new Map();
function getUserConfig(userId) {
    if (!userSettings.has(userId)) {
        userSettings.set(userId, {
            huntEnabled: true,
            prayEnabled: true,
            owoEnabled: true,
            pingsEnabled: true,
            replyEnabled: true,
            mode: 'text',
            huntGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            prayGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif"
        });
    }
    return userSettings.get(userId);
}

const activeTimers = new Map();

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap memantau!`);
});

// --- 🎨 EMBED SERVER SETTINGS (BENTUK PERSIS GAMBAR KEDUA SAMPAI PRAY) ---
function createServerSettingsEmbed(guildId) {
    const config = getServerConfig(guildId);

    return new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Server Settings')
        .setDescription(
            `⚙️ **OwO bot prefix**\n` +
            `\`\`\`\n${config.owoPrefix}\n\`\`\`\n` +
            `do \`owoprefix\` to update\n\n` +
            `🤖 **reaction bot prefix**\n` +
            `\`\`\`\n${config.botPrefix}\n\`\`\`\n` +
            `\`!pai s prefix\` to update\n\n` +
            `🔄 **use default prefix !pai**\n` +
            `${config.useDefaultPrefix ? '✅' : '❌'}\n` +
            `\`!pai s default\` to update\n\n` +
            `🌱 **owo reminder**\n` +
            `\`!pai s owo\` to update\n` +
            `\`{USER} ${config.owoMsg}\`\n\n` +
            `🌱 **hunt/battle reminder**\n` +
            `\`!pai s hunt\` to update\n` +
            `\`{USER} ${config.huntMsg}\`\n\n` +
            `☘️ **pray/curse reminder**\n` +
            `\`!pai s pray\` to update\n` +
            `\`{USER} ${config.prayMsg}\``
        );
}

// --- 🎨 EMBED HELP & USER SETTINGS ---
function createHelpEmbed(guildName, avatarURL) {
    return new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({ name: '🏓 Reminders', iconURL: client.user.displayAvatarURL() })
        .setDescription(
            `Gunakan \`!pai help\` untuk melihat bantuan.\n\n` +
            `\`owo\`\n` +
            `Do \`!pai owo\` to manage your **owo/uwu** 🌿 reminder\n\n` +
            `\`owoh\`\n` +
            `Do \`!pai owoh\` to manage your **owoh/owob** 🌿⚔️ reminder\n\n` +
            `\`owopray\`\n` +
            `Do \`!pai owopray\` to manage your **pray/curse** 🙏👻 reminder`
        )
        .setFooter({ text: `Dibuat khusus untuk Server ${guildName || 'OPPAI'}`, iconURL: avatarURL });
}

function createSettingsEmbed(user, type) {
    const config = getUserConfig(user.id);
    let isEnabled = type === 'owoh' ? config.huntEnabled : (type === 'owo' ? config.owoEnabled : config.prayEnabled);
    let title = `${user.username}'s ${type === 'owoh' ? 'hunt/battle' : (type === 'owo' ? 'owo/uwu' : 'pray/curse')} reminder settings`;

    return new EmbedBuilder()
        .setColor(isEnabled ? '#43B581' : '#F04747')
        .setAuthor({ name: title, iconURL: user.displayAvatarURL() })
        .setDescription(
            `${isEnabled ? '✅' : '❌'} **Is this reminder enabled?**\n\n` +
            `${config.pingsEnabled ? '✅' : '❌'} **Pings / mentions enabled?**\n` +
            `${config.replyEnabled ? '✅' : '❌'} **Use inline replies?**\n` +
            `💬 **Current Mode:** \`${config.mode.toUpperCase()}\``
        );
}

function createSettingsButtons(user, type) {
    const config = getUserConfig(user.id);
    let isEnabled = type === 'owoh' ? config.huntEnabled : (type === 'owo' ? config.owoEnabled : config.prayEnabled);

    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`toggle_enable_${type}_${user.id}`)
                .setLabel(type === 'owoh' ? 'hunt/battle' : type)
                .setEmoji('⚔️')
                .setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`toggle_ping_${type}_${user.id}`)
                .setLabel('ping')
                .setEmoji('🔴')
                .setStyle(config.pingsEnabled ? ButtonStyle.Success : ButtonStyle.Secondary)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`toggle_reply_${type}_${user.id}`)
                .setLabel('reply')
                .setEmoji('↩️')
                .setStyle(config.replyEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`toggle_mode_${type}_${user.id}`)
                .setLabel(`mode: ${config.mode}`)
                .setEmoji('🖼️')
                .setStyle(ButtonStyle.Primary)
        )
    ];
}

// --- 📩 MESSAGE EVENT ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const msgLower = content.toLowerCase();
    const userId = message.author.id;
    const guildId = message.guild?.id || 'dm';
    const userCfg = getUserConfig(userId);
    const serverCfg = getServerConfig(guildId);

    let usedPrefix = null;
    if (msgLower.startsWith(defaultTrigger.toLowerCase())) {
        usedPrefix = defaultTrigger;
    } else if (customPrefix && msgLower.startsWith(customPrefix.toLowerCase())) {
        usedPrefix = customPrefix;
    }

    // --- 🛠️ COMMAND HANDLER (!pai ...) ---
    if (usedPrefix) {
        const args = content.slice(usedPrefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        // 1. MENU HELP (!pai / !pai help)
        if (!command || command === 'help') {
            const helpEmbed = createHelpEmbed(message.guild?.name, message.author.displayAvatarURL());
            const helpButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help_reminders').setLabel('Reminders').setEmoji('🏓').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('help_util').setLabel('Util').setEmoji('⚙️').setStyle(ButtonStyle.Secondary)
            );
            return message.channel.send({ embeds: [helpEmbed], components: [helpButtons] });
        }

        // 2. FITUR SERVER SETTING DAN UBAH TEKS REMINDER (!pai s / !pai s owo set / !pai s hunt set ...)
        if (command === 's' || command === 'set') {
            const subCmd = args.shift()?.toLowerCase();

            // Cuma ngetik `!pai s` -> Munculkan Embed Server Settings (Gambar kedua)
            if (!subCmd) {
                const embed = createServerSettingsEmbed(guildId);
                return message.channel.send({ embeds: [embed] });
            }

            // Mengubah pesan owo (`!pai s owo set <pesan>` atau `!pai s owo <pesan>`)
            if (subCmd === 'owo') {
                if (args[0]?.toLowerCase() === 'set') args.shift();
                const newMsg = args.join(" ");
                if (!newMsg) {
                    return message.channel.send({ content: `<@${userId}> ${serverCfg.owoMsg}` });
                }
                serverCfg.owoMsg = newMsg;
                return message.channel.send(`✅ Updated **owo/uwu** reminder for this server. Users will now have this reminder message instead assuming they have the \`default\` setting for \`!pai owo\` enabled.`);
            }

            // Mengubah pesan hunt (`!pai s hunt set <pesan>` atau `!pai s hunt <pesan>`)
            if (subCmd === 'hunt' || subCmd === 'owoh') {
                if (args[0]?.toLowerCase() === 'set') args.shift();
                const newMsg = args.join(" ");
                if (!newMsg) {
                    return message.channel.send({ content: `<@${userId}> ${serverCfg.huntMsg}` });
                }
                serverCfg.huntMsg = newMsg;
                return message.channel.send(`✅ Updated **hunt/battle** reminder for this server.`);
            }

            // Mengubah pesan pray (`!pai s pray set <pesan>` atau `!pai s pray <pesan>`)
            if (subCmd === 'pray' || subCmd === 'owopray') {
                if (args[0]?.toLowerCase() === 'set') args.shift();
                const newMsg = args.join(" ");
                if (!newMsg) {
                    return message.channel.send({ content: `<@${userId}> ${serverCfg.prayMsg}` });
                }
                serverCfg.prayMsg = newMsg;
                return message.channel.send(`✅ Updated **pray/curse** reminder for this server.`);
            }
        }

        // 3. SHORTCUT PANEL SETTING USER (!pai owo, !pai owoh, !pai owopray)
        if (command === 'owoh' || command === 'owo' || command === 'owopray') {
            const embed = createSettingsEmbed(message.author, command);
            const components = createSettingsButtons(message.author, command);
            return message.channel.send({ embeds: [embed], components });
        }
    }

    // --- 🎯 REMINDER TRIGGER (15 DETIK) ---

    // 1. Trigger owo / uwu
    if ((msgLower === 'owo' || msgLower === 'uwu') && userCfg.owoEnabled) {
        const timerKey = `${userId}_owo_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr} ${serverCfg.owoMsg}` };
            if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
            if (userCfg.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(userCfg.huntGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 15000);

        activeTimers.set(timerKey, timer);
        return;
    }

    // 2. Trigger wh / owoh
    if ((msgLower === 'wh' || msgLower === 'owo hunt' || msgLower.startsWith('wh ') || msgLower.startsWith('owo h ')) && userCfg.huntEnabled) {
        const timerKey = `${userId}_hunt_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr} ${serverCfg.huntMsg}` };
            if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
            if (userCfg.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(userCfg.huntGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 15000);

        activeTimers.set(timerKey, timer);
        return;
    }

    // 3. Trigger wpray / owopray (5 Menit)
    if ((msgLower.includes('wpray') || msgLower.includes('owo pray') || msgLower === 'wp' || msgLower === 'pr') && userCfg.prayEnabled) {
        const timerKey = `${userId}_pray_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr} ${serverCfg.prayMsg}` };
            if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
            if (userCfg.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(userCfg.prayGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 300000);

        activeTimers.set(timerKey, timer);
        return;
    }
});

// --- 🔘 INTERACTION BUTTON HANDLER ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const parts = interaction.customId.split('_');

    if (parts[0] === 'toggle' && interaction.user.id === parts[3]) {
        const key = parts[1];
        const type = parts[2];
        const ownerId = parts[3];

        const config = getUserConfig(ownerId);

        if (key === 'enable') {
            if (type === 'owoh') config.huntEnabled = !config.huntEnabled;
            if (type === 'owo') config.owoEnabled = !config.owoEnabled;
            if (type === 'owopray') config.prayEnabled = !config.prayEnabled;
        } else if (key === 'ping') {
            config.pingsEnabled = !config.pingsEnabled;
        } else if (key === 'reply') {
            config.replyEnabled = !config.replyEnabled;
        } else if (key === 'mode') {
            config.mode = config.mode === 'text' ? 'gif' : 'text';
        }

        const embed = createSettingsEmbed(interaction.user, type);
        const components = createSettingsButtons(interaction.user, type);

        await interaction.update({ embeds: [embed], components });
    } else if (parts[0] === 'toggle' && interaction.user.id !== parts[3]) {
        await interaction.reply({ content: '❌ Ini bukan panel setting milikmu!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
        
