// vector: creazione, accesso, tre modi di scorrerlo, inserimenti e
// cancellazioni, matrici.
#include <iostream>
#include <stdexcept>    // out_of_range
#include <vector>
using namespace std;

int main() {
    vector<int> v;                              // vuoto
    for (int i = 1; i <= 5; i++) v.push_back(i * 10);
    cout << "size " << v.size() << ", v[0] = " << v[0] << ", v.back() = " << v.back() << '\n';

    vector<int> zeri(4, 0);                     // 4 elementi uguali a 0
    vector<int> w = {5, 3, 8};                  // elenco di valori
    cout << "zeri.size() = " << zeri.size() << ", w.at(2) = " << w.at(2) << '\n';
    try {
        cout << w.at(10) << '\n';               // at controlla l'indice
    } catch (const out_of_range&) {
        cout << "w.at(10): indice fuori dai limiti (con w[10] nessun avviso)\n";
    }

//@region scorri
    for (size_t i = 0; i < v.size(); i++) cout << v[i] << ' ';   // con l'indice
    cout << '\n';
    for (int x : v) cout << x << ' ';                            // range-for
    cout << '\n';
    for (auto it = v.begin(); it != v.end(); ++it) cout << *it << ' ';   // iteratori
    cout << '\n';
//@endregion

//@region modifica
    v.pop_back();                   // toglie l'ultimo (50): O(1)
    v.insert(v.begin(), 0);         // in testa: sposta tutti gli altri, O(n)
    v.erase(v.begin() + 2);         // toglie v[2] (20): sposta quelli dopo, O(n)
//@endregion
    for (int x : v) cout << x << ' ';
    cout << '\n';

//@region matrice
    vector<vector<int>> m(3, vector<int>(4, 0));    // 3 righe, 4 colonne
    m[1][2] = 7;
//@endregion
    cout << "righe " << m.size() << ", colonne " << m[0].size() << ", m[1][2] = " << m[1][2] << '\n';
    return 0;
}
