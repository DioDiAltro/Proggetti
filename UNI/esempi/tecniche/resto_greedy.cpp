// Resto con il metodo greedy: si dà sempre la moneta più grande che ci sta.
// Con le monete dell'euro il numero di monete è sempre il minimo possibile;
// con le monete {4, 3, 1} no: per 6 il greedy dà 4 + 1 + 1, ma 3 + 3 basta.
#include <iostream>
#include <vector>
using namespace std;

//@region greedy
// monete: valori in ordine decrescente, ognuno disponibile in quantità illimitata
vector<int> restoGreedy(const vector<int>& monete, int importo) {
    vector<int> usate;
    for (int c : monete) {                  //@coin
        while (importo >= c) {              //@fits
            usate.push_back(c);             //@take
            importo -= c;
        }
    }
    return usate;   // se qui importo > 0, il resto esatto non è stato dato
}
//@endregion

void stampa(int importo, const vector<int>& usate) {
    cout << importo << " = ";
    for (size_t i = 0; i < usate.size(); i++) cout << (i > 0 ? " + " : "") << usate[i];
    cout << "  (" << usate.size() << " monete)\n";
}

int main() {
    vector<int> euro = {200, 100, 50, 20, 10, 5, 2, 1};   // in centesimi
    cout << "Monete dell'euro (centesimi):\n";
    stampa(289, restoGreedy(euro, 289));
    stampa(48, restoGreedy(euro, 48));

    vector<int> strane = {4, 3, 1};
    cout << "Monete {4, 3, 1}:\n";
    stampa(6, restoGreedy(strane, 6));
    cout << "ma 6 = 3 + 3 usa solo 2 monete: qui il greedy non è ottimo.\n";
    return 0;
}
