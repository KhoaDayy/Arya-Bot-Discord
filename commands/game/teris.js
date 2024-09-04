const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const aryateris = require('./../../utility/teris'); // Đảm bảo đường dẫn đến tệp đúng

module.exports = {
    deleted: true,
    data: new SlashCommandBuilder()
        .setName('teris')
        .setDescription('Game Tetris nhưng nó là phiên bản Discord🐧'),

        execute: async ( interaction ) => {
        // Khởi tạo biến và cấu hình
        let board = [];
        let points = 0;
        let lines = 0;
        let down_pressed = false;
        let rotate_clockwise = false;
        let rotation_pos = 0;
        let h_movement = 0;
        let is_new_shape = false;
        let start_higher = false;
        let game_over = false;
        let index = 0;
        const num_of_rows = 18;
        const num_of_cols = 10;
        const empty_square = ':black_large_square:';
        const embed_colour = '#077ff7';

        // Tạo class cho khối hình Tetris
        class Tetronimo {
            constructor(starting_pos, colour, rotation_points) {
                this.starting_pos = starting_pos;
                this.colour = colour;
                this.rotation_points = rotation_points;
            }
        }

        const main_wall_kicks = [
            [[0, 0], [0, -1], [-1, -1], [2, 0], [2, -1]],
            [[0, 0], [0, 1], [1, 1], [-2, 0], [-2, 1]],
            [[0, 0], [0, 1], [-1, 1], [2, 0], [2, 1]],
            [[0, 0], [0, -1], [1, -1], [-2, 0], [-2, -1]]
        ];

        const i_wall_kicks = [
            [[0, 0], [0, -2], [0, 1], [1, -2], [-2, 1]],
            [[0, 0], [0, -1], [0, 2], [-2, -1], [1, 2]],
            [[0, 0], [0, 2], [0, -1], [-1, 2], [2, -1]],
            [[0, 0], [0, 1], [0, -2], [2, 1], [-1, -2]]
        ];

        const rot_adjustments = {
            ':blue_square:': [[0, 1], [-1, -1], [0, 0], [-1, 0]],
            ':brown_square:': [[0, 0], [0, 1], [0, 0], [0, -1]],
            ':orange_square:': [[0, -1], [0, 0], [-1, 1], [0, 0]],
            ':yellow_square:': [[0, 0], [0, 0], [0, 0], [0, 0]],
            ':green_square:': [[0, 0], [0, 0], [0, 0], [0, 0]],
            ':purple_square:': [[0, 0], [1, 1], [0, -1], [0, 1]],
            ':red_square:': [[1, -1], [-1, -1], [0, 2], [-1, -1]]
        };

        // Tạo các hình dạng khối Tetris
        const shape_I = new Tetronimo([[0, 3], [0, 4], [0, 5], [0, 6]], aryateris.blue_square, [1, 1, 1, 1]);
        const shape_J = new Tetronimo([[0, 3], [0, 4], [0, 5], [-1, 3]], aryateris.brown_square, [1, 1, 2, 2]);
        const shape_L = new Tetronimo([[0, 3], [0, 4], [0, 5], [-1, 5]], aryateris.orange_square, [1, 2, 2, 1]);
        const shape_O = new Tetronimo([[0, 4], [0, 5], [-1, 4], [-1, 5]], aryateris.yellow_square, [1, 1, 1, 1]);
        const shape_S = new Tetronimo([[0, 3], [0, 4], [-1, 4], [-1, 5]], aryateris.green_square, [2, 2, 2, 2]);
        const shape_T = new Tetronimo([[0, 3], [0, 4], [0, 5], [-1, 4]], aryateris.purple_square, [1, 1, 3, 0]);
        const shape_Z = new Tetronimo([[0, 4], [0, 5], [-1, 3], [-1, 4]], aryateris.red_square, [0, 1, 0, 2]);

        // Khởi tạo bảng với ô trống
        function make_empty_board() {
            for (let row = 0; row < num_of_rows; row++) {
                board[row] = [];
                for (let col = 0; col < num_of_cols; col++) {
                    board[row][col] = empty_square;
                }
            }
        }

        function fill_board(emoji) {
            for (let row = 0; row < num_of_rows; row++) {
                for (let col = 0; col < num_of_cols; col++) {
                    if (board[row][col] !== emoji) {
                        board[row][col] = emoji;
                    }
                }
            }
        }

        function format_board_as_str() {
            let board_as_str = '';
            for (let row = 0; row < num_of_rows; row++) {
                for (let col = 0; col < num_of_cols; col++) {
                    board_as_str += board[row][col];
                    if (col === num_of_cols - 1) {
                        board_as_str += '\n';
                    }
                }
            }
            return board_as_str;
        }

        function get_random_shape() {
            const shapes = [shape_I, shape_J, shape_L, shape_O, shape_S, shape_T, shape_Z];
            const random_shape = shapes[Math.floor(Math.random() * shapes.length)];
            if (start_higher) {
                for (let s of random_shape.starting_pos) {
                    s[0] -= 1;
                }
            } else {
                starting_pos = random_shape.starting_pos.slice();
            }
            is_new_shape = true;
            return [random_shape.starting_pos.slice(), random_shape.colour, random_shape.rotation_points];
        }

        function do_wall_kicks(shape, old_shape_pos, shape_colour) {
            let new_shape_pos = [];
            const kick_set = shape_colour === aryateris.blue_square ? main_wall_kicks[rotation_pos] : i_wall_kicks[rotation_pos];

            for (let kick of kick_set) {
                new_shape_pos = [];
                for (let square of shape) {
                    const [square_row, square_col] = square;
                    const [kick_row, kick_col] = kick;
                    const new_square_row = square_row + kick_row;
                    const new_square_col = square_col + kick_col;

                    if (0 <= new_square_col && new_square_col < num_of_cols && 0 <= new_square_row && new_square_row < num_of_rows) {
                        const square_checking = board[new_square_row][new_square_col];
                        if (square_checking !== empty_square && !old_shape_pos.some(pos => pos[0] === new_square_row && pos[1] === new_square_col)) {
                            new_shape_pos = [];
                            break;
                        } else {
                            new_shape_pos.push([new_square_row, new_square_col]);
                        }
                        if (new_shape_pos.length === 4) {
                            return new_shape_pos;
                        }
                    } else {
                        new_shape_pos = [];
                        break;
                    }
                }
            }
            return old_shape_pos;
        }

        function rotate_shape(shape, direction, rotation_point_index, shape_colour) {
            const rotation_point = shape[rotation_point_index];
            let new_shape = [];

            for (let square of shape) {
                const [square_row, square_col] = square;
                if (direction === 'clockwise') {
                    const new_square_row = (square_col - rotation_point[1]) + rotation_point[0] + rot_adjustments[shape_colour][rotation_pos - 1][0];
                    const new_square_col = -(square_row - rotation_point[0]) + rotation_point[1] + rot_adjustments[shape_colour][rotation_pos - 1][1];
                    new_shape.push([new_square_row, new_square_col]);
                } else if (direction === 'anticlockwise') {
                    const new_square_row = -(square_col - rotation_point[1]) + rotation_point[0];
                    const new_square_col = (square_row - rotation_point[0]) + rotation_point[1];
                    new_shape.push([new_square_row, new_square_col]);
                }
                if (0 <= square_col && square_col < num_of_cols && 0 <= square_row && square_row < num_of_rows) {
                    board[square_row][square_col] = empty_square;
                }
            }

            new_shape = do_wall_kicks(new_shape, shape, shape_colour);
            return new_shape;
        }

        function update_board(shape, colour) {
            for (let square of shape) {
                const [row, col] = square;
                board[row][col] = colour;
            }
        }

        function remove_filled_rows() {
            let filled_rows = 0;
            for (let row = num_of_rows - 1; row >= 0; row--) {
                if (board[row].every(cell => cell !== empty_square)) {
                    filled_rows++;
                    for (let r = row; r >= 0; r--) {
                        for (let c = 0; c < num_of_cols; c++) {
                            if (r === 0) {
                                board[r][c] = empty_square;
                            } else {
                                board[r][c] = board[r - 1][c];
                            }
                        }
                    }
                    row++;
                }
            }
            return filled_rows;
        }

        async function runGame(msg, curShape) {
            while (!game_over) {
                const boardStr = format_board_as_str();
                const embed = new EmbedBuilder()
                    .setTitle('Tetris in Discord')
                    .setDescription(boardStr)
                    .setColor(embed_colour);

                await msg.edit({ embeds: [embed] });

                // Logic game loop
                // Ví dụ: Di chuyển, xoay khối, kiểm tra hàng đầy, v.v.

                // Chờ một chút trước khi lặp lại vòng game
                await new Promise(resolve => setTimeout(resolve, 1000)); // Điều chỉnh khoảng thời gian tùy thuộc vào yêu cầu
            }

            // Xử lý khi trò chơi kết thúc
        }

        async function resetGame() {
            make_empty_board();
            points = 0;
            lines = 0;
            down_pressed = false;
            rotate_clockwise = false;
            rotation_pos = 0;
            h_movement = 0;
            is_new_shape = false;
            start_higher = false;
            game_over = false;
            index = 0;
        }

        // Khởi chạy trò chơi khi nhận lệnh /teris
        await resetGame();
        const embed = new EmbedBuilder()
            .setTitle('Tetris in Discord')
            .setDescription(format_board_as_str())
            .setColor(embed_colour);
        await interaction.reply({ embeds: [embed] }).then(async msg => {
            await runGame(msg, get_random_shape());
        });
    }
};
