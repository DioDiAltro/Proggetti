// Parentesi bilanciate con una pila: ogni parentesi aperta aspetta sulla
// pila la sua chiusa; una chiusa deve corrispondere all'ultima aperta.
#include <iostream>
#include <stack>
#include <string>
using namespace std;

//@region parentesi
bool corrispondono(char aperta, char chiusa) {
    return (aperta == '(' && chiusa == ')') ||
           (aperta == '[' && chiusa == ']') ||
           (aperta == '{' && chiusa == '}');
}

bool bilanciata(const string& s) {
    stack<char> pila;                                     //@init
    for (char c : s) {                                    //@for
        if (c == '(' || c == '[' || c == '{') {           //@aperta
            pila.push(c);                                 //@push
        } else if (c == ')' || c == ']' || c == '}') {    //@chiusa
            if (pila.empty()) return false;               //@vuota
            if (!corrispondono(pila.top(), c)) return false;   //@diverse
            pila.pop();                                   //@pop
        }
        // gli altri caratteri (lettere, cifre, operatori) si saltano
    }
    return pila.empty();                                  //@fine
}
//@endregion

int main() {
    string prove[] = {"{[()()]}", "a*(b+c)-[d/e]", "([)]", "(()", "())"};
    for (const string& s : prove)
        cout << s << "  ->  " << (bilanciata(s) ? "bilanciata" : "NON bilanciata") << '\n';
    return 0;
}
