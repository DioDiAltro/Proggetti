// <algorithm> e <numeric>: ordinare, cercare in un vettore ordinato,
// minimo e massimo, somma.
#include <algorithm>
#include <functional>   // greater
#include <iostream>
#include <numeric>      // accumulate
#include <vector>
using namespace std;

void stampa(const vector<int>& v) {
    for (int x : v) cout << x << ' ';
    cout << '\n';
}

int main() {
//@region ordina
    vector<int> v = {7, 2, 9, 4, 2, 8};
    sort(v.begin(), v.end());                       // crescente: O(n log n)
    stampa(v);
    sort(v.begin(), v.end(), greater<int>());       // decrescente
    stampa(v);
    reverse(v.begin(), v.end());                    // di nuovo crescente: O(n)
    stampa(v);
//@endregion

//@region cerca
    // v è ordinato: 2 2 4 7 8 9
    cout << "binary_search(7) = " << binary_search(v.begin(), v.end(), 7)
         << ", binary_search(5) = " << binary_search(v.begin(), v.end(), 5) << '\n';
    auto lo = lower_bound(v.begin(), v.end(), 2);   // primo elemento >= 2
    auto hi = upper_bound(v.begin(), v.end(), 2);   // primo elemento >  2
    cout << "lower_bound(2) in posizione " << (lo - v.begin())
         << ", upper_bound(2) in posizione " << (hi - v.begin())
         << ": i 2 sono " << (hi - lo) << '\n';
    cout << "il 5 andrebbe inserito in posizione " << (lower_bound(v.begin(), v.end(), 5) - v.begin()) << '\n';
//@endregion

//@region minmax
    cout << "min " << *min_element(v.begin(), v.end())
         << ", max " << *max_element(v.begin(), v.end())
         << ", somma " << accumulate(v.begin(), v.end(), 0) << '\n';
    vector<long long> grandi = {2000000000, 2000000000};
    cout << "accumulate con 0:   " << accumulate(grandi.begin(), grandi.end(), 0) << '\n';
    cout << "accumulate con 0LL: " << accumulate(grandi.begin(), grandi.end(), 0LL) << '\n';
//@endregion

//@region stabile
    // stable_sort: a parità di chiave conserva l'ordine di partenza
    vector<pair<int, char>> p = {{2, 'a'}, {1, 'b'}, {2, 'c'}, {1, 'd'}};
    stable_sort(p.begin(), p.end(), [](const pair<int, char>& x, const pair<int, char>& y) {
        return x.first < y.first;                   // confronta solo il numero
    });
    for (auto [k, c] : p) cout << k << c << ' ';
    cout << '\n';
//@endregion
    return 0;
}
