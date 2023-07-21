let white_playing = true
let selected_piece = 0
let last_selected_field_index = null
let selected_field_index = null
let playing_board = []
let possible_moves_obj = {}
let previously_added_possible_moves_indexes = []
let checked = false

function generate_board(){
    let board = document.getElementById("board")
    let offset = 0
    let multiplier = 1
    for(let i = 0; i < 64; i++){
        if(i % 8 == 0){
            offset += multiplier
            multiplier *= -1
        }
        let field = document.createElement("div");
        
        if((i + offset) % 2 == 0)
            field.classList.add("green")
        field.classList.add("field");
        field.id = i
        playing_board.push("x")
        add_on_click_event_listener(field)        
        board.appendChild(field)
    }

    set_figures()
    find_possible_moves()
}
//Ubaciti da se nakon menjanja poteza selected_field_index i last_... resetuju na null
function add_on_click_event_listener(field){
    field.addEventListener("click", () => {
        let index = parseInt(field.id)
        if(playing_board[index] == "x" && selected_field_index != null){
            clicked_on_empty_field(index)
        }
        else if(playing_board[index] != "x"){
            clicked_on_a_figure(index)
        }
    })
}

//If we clicked on an empty field and we have a piece selected, than play the move
function clicked_on_empty_field(index){
    if(!possible_moves_obj[selected_field_index].includes(index))
        return
    if(playing_board[index] == "x" && selected_field_index != null){
        last_selected_field_index = selected_field_index
        selected_field_index = index
        move_piece()
    }
}

//In case we clicked on a field that is not empty, if it's our piece, than select it, if its not our piece, play over it
function clicked_on_a_figure(index){
    if(playing_board[index][0] == get_current_player()){
        selected_field_index = index
        remove_possible_moves_indicators()
        show_possible_moves_indicator(index)
    }
    else if(selected_field_index != null){
        if(!possible_moves_obj[selected_field_index].includes(index))
            return
        last_selected_field_index = selected_field_index
        selected_field_index = index
        move_piece()
    }
}

function get_current_player(){
    if(white_playing)
        return "w"
    else
        return "b"
}

function get_opponent_player(){
    if(white_playing)
        return "b"
    else
        return "w"
}

async function move_piece(){
    await change_figures_visually()
    change_players()
    remove_possible_moves_indicators()
    playing_board[selected_field_index] = playing_board[last_selected_field_index]
    playing_board[last_selected_field_index] = "x"
    selected_field_index = null
    if(under_check(get_current_player() + "k", playing_board.indexOf(get_current_player() + "k"))){
        checked = true
        alert("You are under check")
    }
    await find_possible_moves()
    if(await game_over())
        alert(get_opponent_player() + " won")
}

async function game_over(){
    for(let key in possible_moves_obj){
        if(possible_moves_obj[key].length > 0)
            return false
    }
    return true
} 

async function find_possible_moves(){
    let current_player = get_current_player()
    possible_moves_obj = {}
    for(let i = 0; i < 64; i++){
        if(playing_board[i][0] == current_player){
            possible_moves_obj[i] = []
            generate_possible_moves(i)
        }
    }
}

function change_players(){
    checked = false
    white_playing = !white_playing;
}

async function change_figures_visually(){
    let fields = document.getElementsByClassName("field")
    let playing_figure_class_name = get_class_name_by_figure_code(last_selected_field_index)
    let opponent_figure_class_name = get_class_name_by_figure_code(selected_field_index)
    fields[selected_field_index].classList.add(playing_figure_class_name)
    fields[last_selected_field_index].classList.remove(playing_figure_class_name)
    if(opponent_figure_class_name != "")
        fields[selected_field_index].classList.remove(opponent_figure_class_name)
}

function get_class_name_by_figure_code(index){
    switch(playing_board[index]){
        case "wp":
            return "white_pawn"
            break;
        case "wb":
            return "white_bishop";
            break;
        case "wkn":
            return "white_knight";
            break;
        case "wr":
            return "white_rook";
            break;
        case "wq":
            return"white_queen";
            break;
        case "wk":
            return"white_king";
            break;
            
        case "bp":
            return "black_pawn"
            break;
        case "bb":
            return "black_bishop";
            break;
        case "bkn":
            return "black_knight";
            break;
        case "br":
            return "black_rook";
            break;
        case "bq":
            return"black_queen";
            break;
        case "bk":
            return"black_king";
            break;
        
        default:
            return "";
            break;
    }
}

function set_figures(){
    let fields = document.getElementsByClassName("field")
    
    fields[0].classList.add("black_rook")
    fields[1].classList.add("black_knight")
    fields[2].classList.add("black_bishop")
    fields[3].classList.add("black_queen")
    fields[4].classList.add("black_king")
    fields[5].classList.add("black_bishop")
    fields[6].classList.add("black_knight")
    fields[7].classList.add("black_rook")

    playing_board[0] = "br"
    playing_board[1] = "bkn"
    playing_board[2] = "bb"
    playing_board[3] = "bq"
    playing_board[4] = "bk"
    playing_board[5] = "bb"
    playing_board[6] = "bkn"
    playing_board[7] = "br"
    
    for(let i = 8; i < 16; i++){
        fields[i].classList.add("black_pawn")
        playing_board[i] = "bp"
    }

    fields[56].classList.add("white_rook")
    fields[57].classList.add("white_knight")
    fields[58].classList.add("white_bishop")
    fields[59].classList.add("white_queen")
    fields[60].classList.add("white_king")
    fields[61].classList.add("white_bishop")
    fields[62].classList.add("white_knight")
    fields[63].classList.add("white_rook")

    playing_board[56] = "wr"
    playing_board[57] = "wkn"
    playing_board[58] = "wb"
    playing_board[59] = "wq"
    playing_board[60] = "wk"
    playing_board[61] = "wb"
    playing_board[62] = "wkn"
    playing_board[63] = "wr"

    for(let i = 48; i < 56; i++){
        fields[i].classList.add("white_pawn")
        playing_board[i] = "wp"
    }
}

//Generate possible moves for the clicked figure
//-----------------------------------------------------------------------------
async function generate_possible_moves(index){
    remove_possible_moves_indicators()
    switch(playing_board[index].slice(1)){
        case "r":
            await get_possible_moves_for_rook(index)
            break
        case "kn":
            await get_possible_moves_for_knight(index)
            break
        case "b":
            await get_possible_moves_for_bishop(index)
            break
        case "q":
            await get_possible_moves_for_queen(index)
            break
        case "k":
            await get_possible_moves_for_king(index)
            break
        case "p":
            await get_possible_moves_for_pawn(index)
            break
    }
}

//Display possible moves on the board
function show_possible_moves_indicator(index){
    if(possible_moves_obj[index].length == 0)
        return
    let fields = document.getElementsByClassName("field")
    for(let i of possible_moves_obj[index]){
        fields[i].classList.add("possible_move")
        previously_added_possible_moves_indexes.push(i)
    }
}

//Remove indications from the board
function remove_possible_moves_indicators(){
    if(previously_added_possible_moves_indexes.length == 0)
        return
    let fields = document.getElementsByClassName("field")
    for(let index of previously_added_possible_moves_indexes){
        fields[index].classList.remove("possible_move")
    }
    previously_added_possible_moves_indexes = []
}

//Possible moves for the rook
//-------------------------------------------------------------------------------------
async function get_possible_moves_for_rook(index){
    let x_directions = [0, 1, 0, -1]
    let y_directions = [-1, 0, 1, 0]
    let promises = []
    for(let i = 0; i < 4; i++){
        promises.push(check_directions(index, x_directions, y_directions, i, get_current_player() + "r"))
    }
    
    await Promise.all(promises)
}
//Possible moves for the pawn
//-------------------------------------------------------------------------------------
async function get_possible_moves_for_pawn(index){
    let y_direction = white_playing ? -1 : 1;
    let starting_positions = white_playing ? [48,49,50,51,52,53,54,55] : [8,9,10,11,12,13,14,15] 
    if(playing_board[index + y_direction * 8] == "x"){
        if(!await test_the_field(index + y_direction * 8, index, get_current_player() + "p"))
            if(starting_positions.includes(index))
                if(playing_board[index + 2 * y_direction * 8] == "x")
                    possible_moves_obj[index].push(index + 2 * y_direction * 8)
    }
    if(playing_board[index + y_direction * 8 + 1][0] == get_opponent_player()){
        await test_the_field(index + y_direction * 8 + 1, index, get_current_player() + "p")
    }
    if(playing_board[index + y_direction * 8 - 1][0] == get_opponent_player()){
        await test_the_field(index + y_direction * 8 - 1, index, get_current_player() + "p")
    }

}
//Possible moves for the knight 
//-------------------------------------------------------------------------------------
async function get_possible_moves_for_knight(index){
    let x_directions = [1, 2, 2, 1, -1, -2, -2, -1]
    let y_directions = [2, 1, -1, -2, -2, -1, 1, 2]
    
    for(let i = 0; i < 8; i++){
        let current_position = index
        current_position += x_directions[i] + y_directions[i] * 8
        if(check_knight(current_position, x_directions, i) || current_position < 0 || current_position > 63 || playing_board[current_position][0] == get_current_player())
            continue
        await test_the_field(current_position, index, get_current_player() + "kn")
    }
}

//Check if the knight went off of the sides
function check_knight(current_position, x_directions, i){
    return knight_went_off_left(current_position, x_directions, i) || knight_went_off_right(current_position, x_directions, i)
}

function knight_went_off_left(current_position, x_directions, i){
    return ((current_position + 1) % 8 == 0 && x_directions[i] < 0) || ((current_position + 2) % 8 == 0 && x_directions[i] == -2)
}

function knight_went_off_right(current_position, x_directions, i){
    return (current_position % 8 == 0 && x_directions[i] > 0) || ((current_position - 1) % 8 == 0 && x_directions[i] == 2)
}

//Possible moves for a bishop
//----------------------------------------------------------------------------------------
async function get_possible_moves_for_bishop(index){
    let x_directions = [1, -1, -1, 1]
    let y_directions = [1, 1, -1, -1]
    let promises = []
    for(let i = 0; i < 4; i++){
        promises.push(check_directions(index, x_directions, y_directions, i, get_current_player() + "b"))
    }
    
    await Promise.all(promises)
}

//Possible moves for a queen
//----------------------------------------------------------------------------------------
async function get_possible_moves_for_queen(index){
    let x_directions = [1,1,1,0,-1,-1,-1,0]
    let y_directions = [-1,0,1,1,1,0,-1,-1]
    let promises = []
    for(let i = 0; i < 8; i++){
        promises.push(check_directions(index, x_directions, y_directions, i, get_current_player() + "q"))
    }
    
    await Promise.all(promises)
}

//Possible moves for a king
//----------------------------------------------------------------------------------------
async function get_possible_moves_for_king(index){
    let x_directions = [1,1,1,0,-1,-1,-1,0]
    let y_directions = [-1,0,1,1,1,0,-1,-1]
    for(let i = 0; i < 8; i++){
        let current_position = index
        current_position += x_directions[i] + y_directions[i] * 8
        if(((current_position + 1) % 8 == 0 && x_directions[i] == -1) || (current_position % 8 == 0 && x_directions[i] == 1) || current_position > 63 || current_position < 0 || playing_board[current_position][0] == get_current_player())
            continue
        if(!under_check(playing_board[index], current_position))
            possible_moves_obj[index].push(current_position)
    }
}

//Queen, rook, and bishop have the same direction loop
async function check_directions(current_position, x_directions, y_directions, i, figure){
    let index = current_position
    do{
        current_position += x_directions[i]
        current_position += y_directions[i] * 8
        if(((current_position + 1) % 8 == 0 && x_directions[i] == -1) || (current_position % 8 == 0 && x_directions[i] == 1) || current_position > 63 || current_position < 0 || playing_board[current_position][0] == get_current_player())
            break

        await test_the_field(current_position, index, figure) 
  
        if(playing_board[current_position][0] == get_opponent_player()){
            break
        }
    } while(true);
}


//Check for checks
//----------------------------------------------------------------------------------------
//King is either wk or bk, without it we wouldnt know which king we are checking
function under_check(king, king_index = -1){
    if(king_index == -1)
        king_index = playing_board.indexOf(king)
    
    if(check_pawns(king, king_index) || check_diagonals(king, king_index) || check_horizontals_and_verticals(king, king_index) || check_knights(king, king_index)){
        return true
    }
    
    return false
}

//Return true if king is under attack by pawns
//----------------------------------------------------------------------------------------
function check_pawns(king, king_index){
    let y_direction = king[0] == "w" ? -1 : 1
    let opponent_color = king[0] == "w" ? "b" : "w"
    let x_directions = [-1, 1]
    for(let i = 0; i < 2; i++){
        let current_position = king_index + x_directions[i] + y_direction * 8
        if(((current_position + 1) % 8 == 0 && x_directions[i] == -1) || (current_position % 8 == 0 && x_directions[i] == 1) || current_position > 63 || current_position < 0)
            continue
        if(playing_board[current_position] == opponent_color + "p") 
            return true
    } 
    return false
}

//Return true if king is under attack on a diagonal by a queen or a bishop
//----------------------------------------------------------------------------------------
function check_diagonals(king, king_index){
    let opponent_color = king[0] == "w" ? "b" : "w"
    let x_directions = [1, -1, -1, 1]
    let y_directions = [1, 1, -1, -1]
    for(let i = 0; i < 4; i++){
        let check = check_directions_for_check(opponent_color, king[0], x_directions[i], y_directions[i], king_index, "b")  
        if(check)
            return true
    }
    return false
}

//Return true if king is under attack on a horizontal or vertical line by a queen or a rook
//----------------------------------------------------------------------------------------
function check_horizontals_and_verticals(king, king_index){
    let opponent_color = king[0] == "w" ? "b" : "w"
    let x_directions = [0, 1, 0, -1]
    let y_directions = [-1, 0, 1, 0]
    for(let i = 0; i < 4; i++){
        let check = check_directions_for_check(opponent_color, king[0], x_directions[i], y_directions[i], king_index, "r")  
        if(check)
            return true
    }
    return false
}

//Return true if king is under attack by a knight
//----------------------------------------------------------------------------------------
function check_knights(king, king_index){
    let opponent_color = king[0] == "w" ? "b" : "w"
    let x_directions = [1, 2, 2, 1, -1, -2, -2, -1]
    let y_directions = [2, 1, -1, -2, -2, -1, 1, 2]
    for(let i = 0; i < 8; i++){
        let current_position = king_index
        current_position += x_directions[i] + y_directions[i] * 8
        if(check_knight(current_position, x_directions, i) || current_position < 0 || current_position > 63 || playing_board[current_position][0] == king[0])
            continue
        if(playing_board[current_position] == opponent_color + "kn")
            return true
    }
    return false
}


//Checks the full diagonal to see if any figures are pointing to that field
//This is used for both diagonal, vertical and horizotnal search
//----------------------------------------------------------------------------------------
function check_directions_for_check(opponent_color, current_player_color, x_direction, y_direction, current_position, figure){
    do{
        current_position += x_direction
        current_position += y_direction * 8
        if(((current_position + 1) % 8 == 0 && x_direction == -1) || (current_position % 8 == 0 && x_direction == 1) || current_position > 63 || current_position < 0 || playing_board[current_position][0] == current_player_color)
            break
        if(playing_board[current_position][0] == opponent_color){
            if(playing_board[current_position] == opponent_color + "q" || playing_board[current_position] == opponent_color + figure)
                return true
            return false
        }
    } while(true);

    return false
}

//This function checks if a move will lead to a check or stop the check
async function test_the_field(current_position, previous_position, figure){
    let current_temp = playing_board[current_position]
    let previous_temp = playing_board[previous_position]
    let is_checked = true
    playing_board[current_position] = figure
    playing_board[previous_position] = "x"
    if(!under_check(get_current_player(), playing_board.indexOf(get_current_player() + "k"))){
        possible_moves_obj[previous_position].push(current_position)
        is_checked = false
    }
    playing_board[current_position] = current_temp
    playing_board[previous_position] = previous_temp
    return is_checked
}
