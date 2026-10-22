// Massimo di un array: il ciclo confronta ogni elemento con il massimo
// trovato finora. I confronti sono sempre n-1, qualunque sia l'input.
#include <iostream>
#include <vector>
using namespace std;

//@region max
int massimo(const vector<int>& a) {
    int n = a.size();
    int m = a[0];                           //@init
    for (int i = 1; i < n; i++) {           //@loop
        if (a[i] > m) {                     //@cmp
            m = a[i];                       //@update
        }
    }
    return m;                               //@ret
}
//@endregion

int main() {
    vector<int> a = {3, 8, 2, 9, 4};
    cout << "Massimo: " << massimo(a) << '\n';
    return 0;
}
