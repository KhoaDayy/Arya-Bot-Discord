const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const weather = require('weather-js');

/**
 * 
 * @param { CommandInteraction } interaction
 */

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Xem dự báo thời tiết tại khu vực của bạn!')
        .addStringOption(option => 
            option
                .setName('location')
                .setDescription('Nhập vị trí bạn cần xem dự báo!')
                .setRequired(true)
        ),

    run: async ({ interaction }) => {
        const location = interaction.options.getString('location');
        try {
            weather.find({ search: location, degreeType: 'C',Options: { lang: 'vi-vn' } }, async function(error, result) {
                if (error || !result || result.length === 0) {
                    console.log('Đã xảy ra lỗi hoặc không tìm thấy dữ liệu: ' + error);
                    await interaction.reply('Không thể tìm thấy dữ liệu thời tiết cho khu vực này.');
                    return;
                }

                //console.log(JSON.stringify(result, null, 2));

                const weatherData = result[0];
                const embed = new EmbedBuilder()
                    .setTitle(`Dự báo thời tiết tại khu vực ${weatherData.location.name}!`)
                    .setColor('Random')
                    .setThumbnail(weatherData.current.imageUrl)
                    .addFields(
                        {
                            name: `Mô tả:`,
                            value: `${weatherData.current.skytext}`,
                        },
                        {
                            name: `Nhiệt Độ:`,
                            value: `${weatherData.current.temperature}°C`,
                        },
                        {
                            name: `Nhiệt độ cảm nhận:`,
                            value: `${weatherData.current.feelslike}°C`,
                        },
                        {
                            name: `Độ ẩm:`,
                            value: `${weatherData.current.humidity}%`,
                        },
                        {
                            name: `Gió:`,
                            value: `${weatherData.current.windspeed}`,
                        },
                        {
                            name: `Dự báo 3 ngày tới:`,
                            value: weatherData.forecast.map(day => 
                                `**${day.shortday}**: ${day.skytextday}, Nhiệt Độ Cao nhất: ${day.high}°C, Nhiệt Độ Thấp nhất: ${day.low}°C`
                            ).join('\n'),
                        }

                    );

                replied =await interaction.reply({ embeds: [embed] })
                setTimeout(function () {
                    replied.delete().catch(err => {  });
            }, 300000);
            });
        } catch (error) {
            console.log('Đã xảy ra lỗi: ' + error);
            await interaction.reply('Đã xảy ra lỗi khi xử lý yêu cầu của bạn.');
        }
    }
};
