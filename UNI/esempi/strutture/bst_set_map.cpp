// std::set e std::map: alberi binari di ricerca bilanciati già pronti.
// Tutte le operazioni qui sotto costano O(log n), la visita costa O(n).
#include <iostream>
#include <map>
#include <set>
#include <string>
using namespace std;

int main() {
    //@region set
    set<int> s = {50, 30, 70, 20, 40};
    s.insert(60);       // O(log n)
    s.insert(30);       // c'è già: il set non cambia
    s.erase(20);        // O(log n)

    cout << "set:";
    for (int x : s)     // in ordine crescente
        cout << ' ' << x;
    cout << '\n';

    cout << "40 c'è? " << (s.count(40) ? "sì" : "no") << '\n';
    cout << "minimo " << *s.begin() << ", massimo " << *s.rbegin() << '\n';

    auto it = s.upper_bound(45);   // il primo > 45
    if (it != s.end())
        cout << "successore di 45: " << *it << '\n';
    //@endregion

    //@region map
    map<string, int> voti;          // chiave -> valore
    voti["Rossi"] = 28;
    voti["Bianchi"] = 30;
    voti["Verdi"] = 25;
    voti["Rossi"] = 29;             // stessa chiave: aggiorna

    for (const auto& [nome, voto] : voti)   // ordine per chiave
        cout << nome << ": " << voto << '\n';

    if (voti.find("Neri") == voti.end())
        cout << "Neri non c'è\n";
    //@endregion
    return 0;
}
