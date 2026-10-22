// Due risultati da una funzione: una pair, spacchettata con il C++17.
#include <iostream>
#include <utility>
#include <vector>
using namespace std;

//@region minmax
pair<int, int> minMax(const vector<int>& v) {
    int mn = v[0], mx = v[0];
    for (int x : v) {
        if (x < mn) mn = x;
        if (x > mx) mx = x;
    }
    return {mn, mx};                    // una coppia di valori
}
//@endregion

int main() {
    vector<int> voti = {28, 30, 24, 27};
//@region uso
    auto [lo, hi] = minMax(voti);       // C++17: due variabili in un colpo
//@endregion
    cout << "minimo " << lo << ", massimo " << hi << '\n';
    return 0;
}
