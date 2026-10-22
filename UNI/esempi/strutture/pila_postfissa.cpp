// Valutazione di un'espressione in notazione postfissa (polacca inversa):
// i numeri vanno sulla pila, ogni operatore usa i due numeri in cima.
// I simboli sono separati da spazi: "3 4 + 2 *" vale (3 + 4) * 2 = 14.
#include <iostream>
#include <sstream>
#include <stack>
#include <string>
using namespace std;

//@region postfissa
int valuta(const string& espr) {
    stack<int> pila;                              //@init
    istringstream in(espr);                       // legge un simbolo alla volta
    string tok;
    while (in >> tok) {                           //@tok
        if (tok[0] >= '0' && tok[0] <= '9') {     //@num
            pila.push(stoi(tok));                 //@push
        } else {
            int b = pila.top(); pila.pop();       //@pop-b
            int a = pila.top(); pila.pop();       //@pop-a
            int r = 0;
            if (tok == "+") r = a + b;            //@op-add
            else if (tok == "-") r = a - b;       //@op-sub
            else if (tok == "*") r = a * b;       //@op-mul
            else if (tok == "/") r = a / b;       //@op-div
            pila.push(r);                         //@push-r
        }
    }
    return pila.top();                            //@ret
}
//@endregion

int main() {
    string prove[] = {"3 4 + 2 *", "5 1 2 + 4 * + 3 -", "8 2 / 3 -", "6 2 3 + *"};
    for (const string& e : prove)
        cout << e << "  =  " << valuta(e) << '\n';
    return 0;
}
