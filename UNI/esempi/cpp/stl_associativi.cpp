// Insiemi e dizionari: set e map (ordinati), unordered_set e unordered_map (hash).
#include <iostream>
#include <map>
#include <set>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

int main() {
//@region set
    set<int> s = {5, 1, 8, 1, 3};           // i doppioni spariscono, l'ordine è crescente
    s.insert(4);
    cout << "set:";
    for (int x : s) cout << ' ' << x;
    cout << "\ncount(8) = " << s.count(8) << ", count(2) = " << s.count(2) << '\n';
    s.erase(5);
    cout << "minimo " << *s.begin() << ", massimo " << *s.rbegin()
         << ", primo >= 4: " << *s.lower_bound(4) << '\n';
//@endregion

//@region map
    map<string, int> conta;                 // parola -> numero di volte
    vector<string> testo = {"il", "gatto", "e", "il", "cane", "e", "il", "topo"};
    for (const string& w : testo) conta[w]++;       // una chiave nuova parte da 0
    for (const auto& [parola, n] : conta) cout << parola << ':' << n << ' ';
    cout << '\n';
    if (conta.find("lupo") == conta.end()) cout << "lupo non c'è\n";
    cout << "elementi: " << conta.size();
    cout << ", conta[\"lupo\"] = " << conta["lupo"];     // ATTENZIONE: [] inserisce la chiave
    cout << ", elementi: " << conta.size() << '\n';
//@endregion

//@region hash
    unordered_map<string, int> eta = {{"Anna", 21}, {"Luca", 23}};
    eta["Bea"] = 20;
    cout << "Luca ha " << eta["Luca"] << " anni, elementi: " << eta.size() << '\n';

    unordered_set<int> visti;
    int doppioni = 0;
    for (int x : {4, 7, 4, 1, 7, 4}) {
        if (visti.count(x)) doppioni++;     // O(1) in media
        else visti.insert(x);
    }
    cout << "doppioni: " << doppioni << ", distinti: " << visti.size() << '\n';
//@endregion
    return 0;
}
