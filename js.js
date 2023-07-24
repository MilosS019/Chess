let white_playing = true
let selected_piece = 0
let last_selected_field_index = null
let selected_field_index = null
let playing_board = []
let possible_moves_obj = {}
let previously_added_possible_moves_indexes = []
let checked = false
let promoting = false

let right_black_rook_moved = false
let left_black_rook_moved = false
let black_king_moved = false

let right_white_rook_moved = false
let left_white_rook_moved = false
let white_king_moved = false

let score = {"w":0, "b":0}


//Display and initial variable settings
//---------------------------------------------------------------------------------
async function generate_board(){
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
    await set_figures()
    await find_possible_moves()
}

function get_class_name_by_figure_code(index, transform = true){
    let name = index
    if(transform)
        name = playing_board[index]
    switch(name){
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

async function set_figures(){
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
//-----------------------------------------------------------------------------------------

//Event listeners
//-----------------------------------------------------------------------------------------
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
    if(promoting)
        return
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
    if(promoting)
        return
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
        add_piece_to_eaten()
        move_piece()
    }
}
//-----------------------------------------------------------------------------------------


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

//-----------------------------------------------------------------------------------------

//Move the selected piece and update the board visually
//-----------------------------------------------------------------------------------------
async function move_piece(){
    await change_figures_visually()
    remove_possible_moves_indicators()

    if(await try_to_promote())
        return
    await play_the_move()
    update_scores()
}

function update_scores(){
    let black_score = document.getElementById("black_advantage")
    let white_score = document.getElementById("white_advantage")
    if(score["w"] > score["b"]){
        white_score.innerHTML = " +" + (score["w"] - score["b"])
        black_score.innerHTML = ""
    }else if(score["b"] > score["w"]){
        black_score.innerHTML = " +" + (score["b"] - score["w"])
        white_score.innerHTML = ""
    }
    else{
        black_score.innerHTML = ""
        white_score.innerHTML = ""
    }
}

function add_piece_to_eaten(){
    let eaten_figures_container;
    if(get_current_player() == "w")
        eaten_figures_container = document.getElementById("black_pieces");
    else
        eaten_figures_container = document.getElementById("white_pieces");
    
    let eaten_figure_div = document.createElement("div");
    eaten_figure_div.classList.add("eaten_figure")
    eaten_figure_div.classList.add(get_class_name_by_figure_code(selected_field_index))
    eaten_figures_container.appendChild(eaten_figure_div)
}

async function try_to_promote(){
    if(playing_board[last_selected_field_index] == get_current_player() + "p"){
        if(get_current_player() == "w" && selected_field_index >= 0 && selected_field_index < 8){
            await show_promotion_grid()
            return true
        }
        else if(get_current_player() == "b" && selected_field_index >= 56 && selected_field_index < 64){           
            await show_promotion_grid()
            return true
        }
    }
}

async function play_the_move(){
    if(playing_board[last_selected_field_index] == get_current_player() + "k" && Math.abs(last_selected_field_index - selected_field_index) > 1){
        castle()
    }
    else{
        playing_board[selected_field_index] = playing_board[last_selected_field_index]
        playing_board[last_selected_field_index] = "x"
    }
    change_players()
    selected_field_index = null
    if( under_check(get_current_player() + "k", playing_board.indexOf(get_current_player() + "k"))){
        checked = true
        alert("You are under check")
    }
    still_able_to_castle()
    await find_possible_moves()
    if(await game_over())
    alert(get_opponent_player() + " won")
}

//Update the visuals on figure movement
async function change_figures_visually(){
    let fields = document.getElementsByClassName("field")
    let playing_figure_class_name = get_class_name_by_figure_code(last_selected_field_index)
    let opponent_figure_class_name = get_class_name_by_figure_code(selected_field_index)
    fields[selected_field_index].classList.add(playing_figure_class_name)
    fields[last_selected_field_index].classList.remove(playing_figure_class_name)
    if(opponent_figure_class_name != "")
        fields[selected_field_index].classList.remove(opponent_figure_class_name)
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

//Checks if any of the figures required for castling have moved
function still_able_to_castle(){
    if(get_opponent_player() == "w" && last_selected_field_index == 56)
        left_white_rook_moved = true
    if(get_opponent_player() == "w" && last_selected_field_index == 63)
        right_white_rook_moved = true
    if(get_opponent_player() == "w" && last_selected_field_index == 60)
        white_king_moved = true
    if(get_opponent_player() == "b" && last_selected_field_index == 0)
        left_black_rook_moved = true
    if(get_opponent_player() == "b" && last_selected_field_index == 7)
        right_black_rook_moved = true
    if(get_opponent_player() == "b" && last_selected_field_index == 4)
        black_king_moved = true
}

//Do the castling both visually and in our array
function castle(){
    let fields = document.getElementsByClassName("field")
    playing_board[selected_field_index] = playing_board[last_selected_field_index]
    playing_board[last_selected_field_index] = "x"
    if(last_selected_field_index < selected_field_index){
        let playing_figure_class_name = get_class_name_by_figure_code(last_selected_field_index + 3)
        fields[last_selected_field_index + 1].classList.add(playing_figure_class_name)
        fields[last_selected_field_index + 3].classList.remove(playing_figure_class_name)
        playing_board[last_selected_field_index + 1] = playing_board[last_selected_field_index + 3]
        playing_board[last_selected_field_index + 3] = "x"
    }
    else{
        let playing_figure_class_name = get_class_name_by_figure_code(last_selected_field_index - 4)
        fields[last_selected_field_index - 2].classList.add(playing_figure_class_name)
        fields[last_selected_field_index - 4].classList.remove(playing_figure_class_name)
        playing_board[last_selected_field_index - 2] = playing_board[last_selected_field_index - 4]
        playing_board[last_selected_field_index - 4] = "x"    
    }
}

function promote(figure){
    let fields = document.getElementsByClassName("field")
    let playing_figure_class_name = get_class_name_by_figure_code(figure, false)
    let pawn_class_name = get_class_name_by_figure_code(last_selected_field_index)
    fields[selected_field_index].classList.add(playing_figure_class_name)
    fields[selected_field_index].classList.remove(pawn_class_name)
    playing_board[last_selected_field_index] = figure
    hide_promotion_grid()
    play_the_move()
}

async function show_promotion_grid(){
    if(get_current_player() == "w")
        await show_white_promotion_grid()
    else
        await show_black_promotion_grid()    
}

function hide_promotion_grid(){
    if(get_current_player() == "w")
        hide_white_promotion_grid()
    else
        hide_black_promotion_grid()    

}

async function show_white_promotion_grid(){
    let promotion_grid = document.getElementById("promote_white")
    promotion_grid.classList.remove("visibility_hidden_white")
    promoting = true
}

async function show_black_promotion_grid(){
    let promotion_grid = document.getElementById("promote_black")
    promotion_grid.classList.remove("visibility_hidden_black")
    promoting = true
}

async function hide_white_promotion_grid(){
    let promotion_grid = document.getElementById("promote_white")
    promotion_grid.classList.add("visibility_hidden_white")
    promoting = false
}

async function hide_black_promotion_grid(){
    let promotion_grid = document.getElementById("promote_black")
    promotion_grid.classList.add("visibility_hidden_black")
    promoting = false
}
//-----------------------------------------------------------------------------------------
//Checks if the game is over
async function game_over(){
    for(let key in possible_moves_obj){
        if(possible_moves_obj[key].length > 0)
            return false
    }
    return true
} 
//-----------------------------------------------------------------------------------------

//Find possible moves for all of the figures
//-----------------------------------------------------------------------------------------
async function find_possible_moves(){
    let current_player = get_current_player()
    let opponent_player = get_opponent_player()
    possible_moves_obj = {}
    score["w"] = 0
    score["b"] = 0
    for(let i = 0; i < 64; i++){
        if(playing_board[i][0] == current_player){
            possible_moves_obj[i] = []
            await generate_possible_moves(i)
            score[current_player] += get_figure_value(playing_board[i])
        }
        else if(playing_board[i][0] == opponent_player){
            score[opponent_player] += get_figure_value(playing_board[i])
        }
    }
}

function get_figure_value(figure){
    switch(figure.slice(1)){
        case "p":
            return 1;
        case "b":
            return 3;
        case "q": 
            return 8;
        case "r":
            return 5;
        case "kn":
            return 3
        case "k":
            return 0
        default:
            return 0
    }
}

function change_players(){
    checked = false
    white_playing = !white_playing;
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
        let temp = playing_board[current_position]
        playing_board[current_position] = playing_board[index]
        playing_board[index] = "" 
        if(!under_check(playing_board[current_position], current_position))
            possible_moves_obj[index].push(current_position)
        playing_board[index] = playing_board[current_position]
        playing_board[current_position] = temp 
        
        
    }
    if(!checked){
        await able_to_castle_right(index)
        await able_to_castle_left(index)
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

//Checks if the king can castle in any direction
//----------------------------------------------------------------------------------------
async function able_to_castle_right(index){
    if(get_current_player() == "w" && white_king_moved == false && right_white_rook_moved == false && playing_board[63] == "wr"){
        if(playing_board[61] == "x" && playing_board[62] == "x"){
            playing_board[60] = "x"
            playing_board[61] = "wr"
            playing_board[62] = "wk"
            playing_board[63] = "x"
            if(! under_check("wk", 62))
                possible_moves_obj[index].push(62)
            
            playing_board[60] = "wk"
            playing_board[61] = "x"
            playing_board[62] = "x"
            playing_board[63] = "wr"
        }
    }

    else if(get_current_player() == "b" && black_king_moved == false && right_black_rook_moved == false && playing_board[7] == "br"){
        if(playing_board[5] == "x" && playing_board[6] == "x"){
            playing_board[4] = "x"
            playing_board[5] = "br"
            playing_board[6] = "bk"
            playing_board[7] = "x"
            if(! under_check("bk", 6))
                possible_moves_obj[index].push(6)
            playing_board[4] = "bk"
            playing_board[5] = "x"
            playing_board[6] = "x"
            playing_board[7] = "br"    
        }
    }
}


async function able_to_castle_left(index){
    if(get_current_player() == "w" && white_king_moved == false && left_white_rook_moved == false && playing_board[56] == "wr"){
        if(playing_board[57] == "x" && playing_board[58] == "x" && playing_board[59] == "x"){
            playing_board[56] = "x"
            playing_board[57] = "wk"
            playing_board[58] = "wr"
            playing_board[59] = "x"
            playing_board[60] = "x"
            if(! under_check("wk", 57))
                possible_moves_obj[index].push(57)
            playing_board[56] = "wr"
            playing_board[57] = "x"
            playing_board[58] = "x"
            playing_board[59] = "x"
            playing_board[60] = "wk"
        }
    }

    else if(get_current_player() == "b" && black_king_moved == false && right_black_rook_moved == false && playing_board[0] == "br"){
        if(playing_board[1] == "x" && playing_board[2] == "x" && playing_board[3] == "x"){
            playing_board[0] = "x"
            playing_board[1] = "bk"
            playing_board[2] = "br"
            playing_board[3] = "x"
            playing_board[4] = "x"
            if(! under_check("bk", 1))
                possible_moves_obj[index].push(1)
            playing_board[0] = "br"
            playing_board[1] = "x"
            playing_board[2] = "x"
            playing_board[3] = "x"
            playing_board[4] = "bk"
        }
    }
}
//----------------------------------------------------------------------------------------


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
    if(! under_check(get_current_player(), playing_board.indexOf(get_current_player() + "k"))){
        possible_moves_obj[previous_position].push(current_position)
        is_checked = false
    }
    playing_board[current_position] = current_temp
    playing_board[previous_position] = previous_temp
    return is_checked
}
