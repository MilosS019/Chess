let white_playing = true
let selected_piece = 0
let last_selected_field_index = null
let selected_field_index = null
let playing_board = []
let possible_moves = []

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
    if(!possible_moves.includes(index))
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
        generate_possible_moves(index)
    }
    else if(selected_field_index != null){
        if(!possible_moves.includes(index))
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
}

function change_players(){

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
function generate_possible_moves(index){
    remove_possible_moves_indicators()
    switch(playing_board[index].slice(1)){
        case "r":
            get_possible_moves_for_rook(index)
            show_possible_moves_indicator()
            break
        case "kn":
            get_possible_moves_for_knight(index)
            show_possible_moves_indicator()
            break
        case "b":
            get_possible_moves_for_bishop(index)
            show_possible_moves_indicator()
            break
        case "q":
            get_possible_moves_for_queen(index)
            show_possible_moves_indicator()
            break
        case "k":
            get_possible_moves_for_king(index)
            show_possible_moves_indicator()
            break
        case "p":
            get_possible_moves_for_pawn(index)
            show_possible_moves_indicator()
            break
    }
}

//Display possible moves on the board
function show_possible_moves_indicator(){
    if(possible_moves.length == 0)
        return
    let fields = document.getElementsByClassName("field")
    for(let index of possible_moves){
        fields[index].classList.add("possible_move")
    }
}

//Remove indications from the board
function remove_possible_moves_indicators(){
    if(possible_moves.length == 0)
        return
    let fields = document.getElementsByClassName("field")
    for(let index of possible_moves){
        fields[index].classList.remove("possible_move")
    }
}

//Possible moves for the rook
//-------------------------------------------------------------------------------------
function get_possible_moves_for_rook(index){
    possible_moves = []
    let x_directions = [0, 1, 0, -1]
    let y_directions = [-1, 0, 1, 0]
    for(let i = 0; i < 4; i++){
        let current_position = index
        do{
            current_position += x_directions[i]
            current_position += y_directions[i] * 8
            if(((current_position + 1) % 8 == 0 && x_directions[i] == -1) || (current_position % 8 == 0 && x_directions[i] == 1) || current_position > 63 || current_position < 0 || playing_board[current_position][0] == get_current_player())
                break
            possible_moves.push(current_position)
            if(playing_board[current_position][0] == get_opponent_player()){
                break
            }
        } while(true);
    }
}
//Possible moves for the pawn
//-------------------------------------------------------------------------------------
function get_possible_moves_for_pawn(index){
    possible_moves = []
    let y_direction = white_playing ? -1 : 1;
    let starting_positions = white_playing ? [48,49,50,51,52,53,54,55] : [8,9,10,11,12,13,14,15] 
    if(playing_board[index + y_direction * 8] == "x"){
        possible_moves.push(index + y_direction * 8)
        if(starting_positions.includes(index))
            if(playing_board[index + 2 * y_direction * 8] == "x")
                possible_moves.push(index + 2 * y_direction * 8)
    }
    if(playing_board[index + y_direction * 8 + 1][0] == get_opponent_player())
        possible_moves.push(index + y_direction * 8 + 1)
    if(playing_board[index + y_direction * 8 - 1][0] == get_opponent_player())
        possible_moves.push(index + y_direction * 8 - 1)

}
//Possible moves for the knight 
//-------------------------------------------------------------------------------------
function get_possible_moves_for_knight(index){
    possible_moves = []
    let x_directions = [1, 2, 2, 1, -1, -2, -2, -1]
    let y_direction = [2, 1, -1, -2, -2, -1, 1, 2]
    
    for(let i = 0; i < 8; i++){
        let current_position = index
        current_position += x_directions[i] + y_direction[i] * 8
        if(check_knight(current_position, x_directions, i) || current_position < 0 || current_position > 63 || playing_board[current_position][0] == get_current_player())
            continue
        possible_moves.push(current_position) 
    }
}

//Check if the knight went off of the sides
function check_knight(current_position, x_directions, i){
    return knight_went_off_left(current_position, x_directions, i) || knight_went_off_right(current_position, x_directions, i)
}

function knight_went_off_left(current_position, x_directions, i){
    return ((current_position + 1) % 8 == 0 && x_directions[i] < 0) || ((current_position + 2) % 8 == 0 && x_directions[i] < 0)
}

function knight_went_off_right(current_position, x_directions, i){
    return (current_position % 8 == 0 && x_directions[i] > 0) || ((current_position - 1) % 8 == 0 && x_directions[i] > 0)
}



