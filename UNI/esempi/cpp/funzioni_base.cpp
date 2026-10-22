// Com'è fatta una funzione: tipo di ritorno, nome, parametri, corpo, return.
#include <iostream>
#include <string>
using namespace std;

//@region anatomia
int quadrato(int x) {           // tipo di ritorno, nome, parametri
    return x * x;               // restituisce il valore e termina
}

void saluta(string nome) {      // void: non restituisce niente
    cout << "Ciao " << nome << '\n';
}
//@endregion

int main() {
//@region chiamate
    int q = quadrato(7);        // l'argomento 7 va nel parametro x: q vale 49
    cout << q << '\n';
    saluta("Ada");              // stampa: Ciao Ada
//@endregion
    return 0;
}
