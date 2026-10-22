// Le tabelle hash della libreria standard: unordered_set e unordered_map.
#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

int main() {
    cout << boolalpha;

    //@region set
    unordered_set<int> visti;                    // insieme di chiavi, senza ordine
    int dati[] = {4, 8, 15, 16, 23, 42, 15, 4};
    for (int x : dati)
        visti.insert(x);                         // i doppioni vengono ignorati
    cout << "chiavi distinte: " << visti.size() << '\n';
    cout << "contiene 16: " << (visti.count(16) == 1) << '\n';
    visti.erase(16);
    cout << "dopo erase, contiene 16: " << (visti.count(16) == 1) << '\n';
    //@endregion

    //@region map
    unordered_map<string, int> conta;            // parola -> quante volte compare
    string testo[] = {"pila", "coda", "pila", "lista", "pila", "coda"};
    for (const string& w : testo)
        conta[w]++;                              // [] crea la voce con 0 se manca

    vector<string> parole;                       // l'ordine di visita non è definito:
    for (const auto& voce : conta)               // per stampare in ordine si ordina a parte
        parole.push_back(voce.first);
    sort(parole.begin(), parole.end());
    for (const string& w : parole)
        cout << w << ": " << conta[w] << '\n';

    auto it = conta.find("albero");              // find non crea voci, [] sì
    cout << "albero trovato: " << (it != conta.end()) << '\n';
    //@endregion

    //@region carico
    unordered_map<int, int> quadrati;
    quadrati.reserve(100);                       // posto per 100 chiavi: niente rehash
    for (int i = 0; i < 100; i++) quadrati[i] = i * i;
    cout << "quadrati[12] = " << quadrati[12] << '\n';
    cout << "load_factor <= max_load_factor: "
         << (quadrati.load_factor() <= quadrati.max_load_factor()) << '\n';
    cout << "max_load_factor predefinito: " << quadrati.max_load_factor() << '\n';
    //@endregion
    return 0;
}
