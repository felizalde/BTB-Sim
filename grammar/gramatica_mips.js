/* lexical grammar */

/*
  Link to parser generator : https://zaa.ch/jison/
*/

%lex
%%

[ \t\r\n\s] { /*NADA.*/ }

((?:\$t|[rR])(?:[12]?[0-9]|3[01]))\b|(\$zero) return 'REG';
     return 'OFFSET';

"(" return '(';
")" return ')';

"," return ',';

"ADDF"|"SUBF"|"MULF"|"DIVF" return 'R_TYPEF';
"addf"|"subf"|"mulf"|"divf" return 'R_TYPEF';
"LF"|"SF" return 'I_TYPEF';
"lf"|"sf" return 'I_TYPEF';

"ADD"|"SUB"|"MUL"|"DIV" return 'R_TYPE';
"add"|"sub"|"mul"|"div" return 'R_TYPE';
"LW"|"SW" return 'I_TYPE';
"lw"|"sw" return 'I_TYPEF';
"BEQ"|"BNEQ"|"beq"|"bneq" return 'I_TYPE_B';
"JUMP"|"jump" return 'J_TYPE';

<<EOF>>               return 'EOF';
.                     return 'INVALID';

/lex

%start expressions

%% /* language grammar */

expressions
    : instruction EOF
        {return $1;}
    ;

instruction
    : R_TYPE REG ',' REG ',' REG
        {

            console.log($1+" "+$2+" "+$3+" "+$4+" "+$5);
        }
    | R_TYPEF REG ',' REG ',' REG
        {alert("TIPO R FLOTANTE");}
    | I_TYPE REG ',' OFFSET '(' REG ')'
        {alert("TIPO I ENTERO");}
    | I_TYPE_B REG ',' REG ',' OFFSET
        {alert("TIPO I BEQ");}
    | I_TYPEF REG ',' OFFSET '(' REG ')'
        {alert("TIPO I FLOTANTE");}
    | J_TYPE OFFSET
        {alert("TIPO J JUMP");}
    ;
