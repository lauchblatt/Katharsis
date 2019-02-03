"""
statistical functions
"""


# calculates the average of a list of numbers
def average(list_of_numbers):
    if(len(list_of_numbers) >= 1):
        return float(sum(list_of_numbers))/len(list_of_numbers)
    else:
        return float(0)

# calculates the median of a list of numbers
def median(list_of_numbers):
    sortedLst = sorted(list_of_numbers)
    lstLen = len(list_of_numbers)
    index = (lstLen - 1) // 2

    if lstLen is 0:
        return 0

    if (lstLen % 2):
        return sortedLst[index]
    else:
        return (sortedLst[index] + sortedLst[index + 1])/2.0

# returns the maximum value of a list of numbers
def custom_max(list_of_numbers):
    if list_of_numbers is not None and len(list_of_numbers) > 0 :
        return max(list_of_numbers)

    return 0

# returns the minimum value of a list of numbers
def custom_min(list_of_numbers):
    if list_of_numbers is not None and len(list_of_numbers) > 0:
        return min(list_of_numbers)

    return 0

    