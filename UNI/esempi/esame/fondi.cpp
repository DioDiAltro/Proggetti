// Esercizio: fondi due vector già ordinati in un unico vector ordinato,
// in tempo Θ(n + m). È la procedura "merge" del merge sort.
#include <iostream>
#include <vector>
using namespace std;

//@region soluzione
vector<int> fondi(const vector<int>& a, const vector<int>& b) {
    vector<int> c;
    c.reserve(a.size() + b.size());
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size()) {
        if (a[i] <= b[j]) c.push_back(a[i++]);   // <= : a parità prende da a (stabile)
        else c.push_back(b[j++]);
    }
    while (i < a.size()) c.push_back(a[i++]);   // quello che resta di a
    while (j < b.size()) c.push_back(b[j++]);   // quello che resta di b
    return c;
}
//@endregion

int main() {
    vector<int> a = {1, 4, 7, 9};
    vector<int> b = {2, 3, 7, 10, 12};
    for (int x : fondi(a, b)) cout << x << ' ';
    cout << '\n';
    for (int x : fondi({}, {5, 6})) cout << x << ' ';
    cout << '\n';
    return 0;
}
